-- LibraryDesk schema
-- Run once in Supabase SQL Editor on a new project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Library Staff',
  role text not null check (role in ('admin', 'librarian')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 200),
  author text not null check (length(trim(author)) between 1 and 160),
  isbn text unique,
  category text,
  total_copies integer not null default 1 check (total_copies >= 0 and total_copies <= 100000),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.borrowers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) between 1 and 160),
  student_id text unique,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.borrowings (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  borrower_id uuid not null references public.borrowers(id) on delete restrict,
  borrowed_at date not null default current_date,
  due_date date not null,
  returned_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint valid_due_date check (due_date >= borrowed_at)
);

create index if not exists borrowings_book_active_idx on public.borrowings(book_id) where returned_at is null;
create index if not exists borrowings_borrower_idx on public.borrowings(borrower_id);
create index if not exists borrowings_due_date_idx on public.borrowings(due_date) where returned_at is null;
create index if not exists books_title_idx on public.books using btree (title);
create index if not exists borrowers_name_idx on public.borrowers using btree (full_name);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at before update on public.books
for each row execute function public.set_updated_at();

drop trigger if exists borrowers_set_updated_at on public.borrowers;
create trigger borrowers_set_updated_at before update on public.borrowers
for each row execute function public.set_updated_at();

create or replace function public.is_library_staff()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.active = true
      and p.role in ('admin', 'librarian')
  );
$$;

revoke all on function public.is_library_staff() from public;
grant execute on function public.is_library_staff() to authenticated;

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.borrowers enable row level security;
alter table public.borrowings enable row level security;

drop policy if exists "staff can read profiles" on public.profiles;
create policy "staff can read profiles" on public.profiles
for select to authenticated using (public.is_library_staff());

-- Staff roles are assigned by an administrator in the Supabase SQL editor.
-- No client-side role changes are granted, which prevents privilege escalation.

drop policy if exists "staff read books" on public.books;
create policy "staff read books" on public.books for select to authenticated using (public.is_library_staff());
drop policy if exists "staff insert books" on public.books;
create policy "staff insert books" on public.books for insert to authenticated with check (public.is_library_staff());
drop policy if exists "staff update books" on public.books;
create policy "staff update books" on public.books for update to authenticated using (public.is_library_staff()) with check (public.is_library_staff());
drop policy if exists "staff delete books" on public.books;
create policy "staff delete books" on public.books for delete to authenticated using (public.is_library_staff());

drop policy if exists "staff read borrowers" on public.borrowers;
create policy "staff read borrowers" on public.borrowers for select to authenticated using (public.is_library_staff());
drop policy if exists "staff insert borrowers" on public.borrowers;
create policy "staff insert borrowers" on public.borrowers for insert to authenticated with check (public.is_library_staff());
drop policy if exists "staff update borrowers" on public.borrowers;
create policy "staff update borrowers" on public.borrowers for update to authenticated using (public.is_library_staff()) with check (public.is_library_staff());
drop policy if exists "staff delete borrowers" on public.borrowers;
create policy "staff delete borrowers" on public.borrowers for delete to authenticated using (public.is_library_staff());

drop policy if exists "staff read borrowings" on public.borrowings;
create policy "staff read borrowings" on public.borrowings for select to authenticated using (public.is_library_staff());
-- Direct inserts/updates/deletes are intentionally not granted to clients.
revoke insert, update, delete on public.borrowings from anon, authenticated;
grant select on public.borrowings to authenticated;
grant select, insert, update, delete on public.books, public.borrowers to authenticated;
grant select on public.profiles to authenticated;

-- Prevent deleting a book with any loan history (FK RESTRICT already does this).
-- Prevent reducing total copies below active loan count.
create or replace function public.guard_book_copy_count()
returns trigger language plpgsql set search_path = ''
as $$
declare active_count integer;
begin
  select count(*) into active_count from public.borrowings b
  where b.book_id = old.id and b.returned_at is null;
  if new.total_copies < active_count then
    raise exception 'Total copies cannot be less than the number currently on loan (%).', active_count;
  end if;
  return new;
end;
$$;

drop trigger if exists books_guard_copy_count on public.books;
create trigger books_guard_copy_count before update of total_copies on public.books
for each row execute function public.guard_book_copy_count();

create or replace function public.issue_book(
  p_book_id uuid,
  p_borrower_id uuid,
  p_borrowed_at date default current_date,
  p_due_date date default (current_date + 14),
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
  v_active boolean;
  v_borrower_active boolean;
  v_out integer;
  v_id uuid;
begin
  if not public.is_library_staff() then
    raise exception 'Not authorized to issue books.';
  end if;
  if p_due_date < p_borrowed_at then
    raise exception 'Due date cannot be earlier than the borrowed date.';
  end if;

  -- Lock book row so simultaneous issues cannot exceed inventory.
  select b.total_copies, b.active into v_total, v_active
  from public.books b where b.id = p_book_id for update;
  if not found then raise exception 'Book not found.'; end if;
  if not v_active then raise exception 'This book is archived and cannot be borrowed.'; end if;

  select br.active into v_borrower_active from public.borrowers br where br.id = p_borrower_id;
  if not found then raise exception 'Borrower not found.'; end if;
  if not v_borrower_active then raise exception 'This borrower is inactive.'; end if;

  select count(*) into v_out from public.borrowings b
  where b.book_id = p_book_id and b.returned_at is null;
  if v_out >= v_total then raise exception 'No available copies remain for this book.'; end if;

  insert into public.borrowings(book_id, borrower_id, borrowed_at, due_date, notes, created_by)
  values (p_book_id, p_borrower_id, p_borrowed_at, p_due_date, nullif(trim(p_notes), ''), (select auth.uid()))
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.return_book(p_borrowing_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_library_staff() then
    raise exception 'Not authorized to return books.';
  end if;

  update public.borrowings
  set returned_at = now()
  where id = p_borrowing_id and returned_at is null;

  if not found then
    if exists (select 1 from public.borrowings where id = p_borrowing_id) then
      raise exception 'This book has already been returned.';
    else
      raise exception 'Borrowing record not found.';
    end if;
  end if;
end;
$$;

revoke all on function public.issue_book(uuid, uuid, date, date, text) from public;
revoke all on function public.return_book(uuid) from public;
grant execute on function public.issue_book(uuid, uuid, date, date, text) to authenticated;
grant execute on function public.return_book(uuid) to authenticated;
