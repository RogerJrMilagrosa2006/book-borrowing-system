<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { createBrowserClient } from '@supabase/ssr';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
  import { Search, Plus, Pencil, Trash2, X, BookOpen, Archive } from 'lucide-svelte';
  export let data;
  const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  let query = '';
  let modal = false;
  let editing: any = null;
  let busy = false;
  let message = '';
  let error = '';
  let form = { title: '', author: '', isbn: '', category: '', total_copies: 1, active: true };
  $: filtered = data.books.filter((b: any) => [b.title,b.author,b.isbn,b.category].some((v: string | null) => (v ?? '').toLowerCase().includes(query.toLowerCase())));
  function openNew() { editing = null; form = { title:'', author:'', isbn:'', category:'', total_copies:1, active:true }; message=''; error=''; modal = true; }
  function openEdit(book: any) { editing = book; form = { title:book.title, author:book.author, isbn:book.isbn ?? '', category:book.category ?? '', total_copies:book.total_copies, active:book.active }; message=''; error=''; modal = true; }
  async function save() {
    busy = true; message=''; error='';
    const payload = { title: form.title.trim(), author: form.author.trim(), isbn: form.isbn.trim() || null, category: form.category.trim() || null, total_copies: Number(form.total_copies), active: form.active };
    const result = editing ? await supabase.from('books').update(payload).eq('id', editing.id) : await supabase.from('books').insert(payload);
    busy = false;
    if (result.error) { error = result.error.message; return; }
    modal = false; message = editing ? 'Book updated.' : 'Book added.'; await invalidateAll();
  }
  async function remove(book: any) {
    if (!confirm(`Delete "${book.title}"? This only works if the book has no borrowing history.`)) return;
    message=''; error='';
    const { error: e } = await supabase.from('books').delete().eq('id', book.id);
    if (e) { error = e.message.includes('foreign key') ? 'This book has borrowing history. Archive it instead of deleting it.' : e.message; return; }
    message = 'Book deleted.'; await invalidateAll();
  }
  async function archive(book: any) {
    const { error: e } = await supabase.from('books').update({ active: !book.active }).eq('id', book.id);
    if (e) error = e.message; else { message = book.active ? 'Book archived.' : 'Book reactivated.'; await invalidateAll(); }
  }
</script>

<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
  <div><p class="text-sm font-semibold text-indigo-600">COLLECTION</p><h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-900">Books</h1><p class="mt-2 text-sm text-slate-500">Manage your library inventory and available copies.</p></div>
  <button on:click={openNew} class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={17}/> Add book</button>
</div>
{#if message}<div class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>{/if}
{#if error || data.error}<div class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || data.error}</div>{/if}
<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 class="font-bold text-slate-900">Book inventory</h2><p class="mt-1 text-xs text-slate-500">{filtered.length} book record(s)</p></div><div class="relative w-full sm:max-w-xs"><Search size={17} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input bind:value={query} placeholder="Search title, author, ISBN..." class="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"/></div></div>
  {#if filtered.length}
    <div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="px-5 py-3">Book</th><th class="px-5 py-3">ISBN</th><th class="px-5 py-3">Category</th><th class="px-5 py-3">Copies</th><th class="px-5 py-3">Status</th><th class="px-5 py-3 text-right">Actions</th></tr></thead><tbody class="divide-y divide-slate-100">
      {#each filtered as book}
        <tr class="hover:bg-slate-50/70"><td class="px-5 py-4"><div class="flex items-center gap-3"><div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={19}/></div><div><div class="font-semibold text-slate-800">{book.title}</div><div class="mt-1 text-xs text-slate-500">{book.author}</div></div></div></td><td class="px-5 py-4 text-slate-500">{book.isbn || '—'}</td><td class="px-5 py-4 text-slate-500">{book.category || '—'}</td><td class="px-5 py-4 font-semibold text-slate-700">{book.total_copies}</td><td class="px-5 py-4">{#if book.active}<span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>{:else}<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Archived</span>{/if}</td><td class="px-5 py-4"><div class="flex justify-end gap-1"><button title="Edit book" on:click={() => openEdit(book)} class="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"><Pencil size={16}/></button><button title={book.active ? 'Archive book' : 'Reactivate book'} on:click={() => archive(book)} class="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-700"><Archive size={16}/></button><button title="Delete book" on:click={() => remove(book)} class="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={16}/></button></div></td></tr>
      {/each}
    </tbody></table></div>
  {:else}
    <div class="p-12 text-center"><BookOpen class="mx-auto h-9 w-9 text-slate-300"/><h3 class="mt-3 font-semibold text-slate-800">No books found</h3><p class="mt-1 text-sm text-slate-500">Try a different search or add your first book.</p></div>
  {/if}
</div>

{#if modal}
  <div class="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="presentation" on:click={(e) => { if (e.target === e.currentTarget) modal = false; }}>
    <div role="dialog" aria-modal="true" aria-labelledby="book-modal-title" class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div class="mb-5 flex items-center justify-between"><div><h2 id="book-modal-title" class="text-xl font-bold text-slate-900">{editing ? 'Edit book' : 'Add a book'}</h2><p class="mt-1 text-sm text-slate-500">Enter the book details below.</p></div><button on:click={() => modal = false} class="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19}/></button></div>
      {#if error}<div class="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>{/if}
      <form on:submit|preventDefault={save} class="space-y-4">
        <div><label for="book-title" class="mb-1.5 block text-sm font-semibold text-slate-700">Title *</label><input id="book-title" bind:value={form.title} required maxlength="200" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"/></div>
        <div><label for="book-author" class="mb-1.5 block text-sm font-semibold text-slate-700">Author *</label><input id="book-author" bind:value={form.author} required maxlength="160" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"/></div>
        <div class="grid gap-4 sm:grid-cols-2"><div><label for="book-isbn" class="mb-1.5 block text-sm font-semibold text-slate-700">ISBN</label><input id="book-isbn" bind:value={form.isbn} class="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"/></div><div><label for="book-category" class="mb-1.5 block text-sm font-semibold text-slate-700">Category</label><input id="book-category" bind:value={form.category} class="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"/></div></div>
        <div><label for="book-total-copies" class="mb-1.5 block text-sm font-semibold text-slate-700">Total copies *</label><input id="book-total-copies" type="number" min="0" max="100000" step="1" bind:value={form.total_copies} required class="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"/>{#if editing}<p class="mt-1 text-xs text-slate-500">Cannot set total copies below the number currently on loan.</p>{/if}</div>
        <label class="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" bind:checked={form.active} class="h-4 w-4 accent-indigo-600"/> Active in inventory</label>
        <div class="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" on:click={() => modal = false} class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={busy} class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{busy ? 'Saving…' : editing ? 'Save changes' : 'Add book'}</button></div>
      </form>
    </div>
  </div>
{/if}
