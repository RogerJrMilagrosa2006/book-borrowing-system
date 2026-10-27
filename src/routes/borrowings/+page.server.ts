import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/login');
  const { data: profile } = await locals.supabase.from('profiles').select('active,role').eq('id', user.id).maybeSingle();
  if (!profile?.active || !['admin','librarian'].includes(profile.role)) throw redirect(303, '/login');
  const [books, borrowers, loans] = await Promise.all([
    locals.supabase.from('books').select('id,title,author,total_copies,active').eq('active', true).order('title'),
    locals.supabase.from('borrowers').select('id,full_name,student_id,active').eq('active', true).order('full_name'),
    locals.supabase.from('borrowings').select('id,book_id,borrower_id,borrowed_at,due_date,returned_at,notes,books(title,author),borrowers(full_name,student_id)').order('borrowed_at', { ascending: false }).limit(500)
  ]);
  return { books: books.data ?? [], borrowers: borrowers.data ?? [], loans: loans.data ?? [], today: new Date().toISOString().slice(0,10), errors: [books.error?.message,borrowers.error?.message,loans.error?.message].filter(Boolean) };
};
