import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/login');
  const { data: profile } = await locals.supabase.from('profiles').select('active,role').eq('id', user.id).maybeSingle();
  if (!profile?.active || profile.role !== 'librarian') throw redirect(303, '/login');
  const { data, error } = await locals.supabase.from('books').select('id,title,author,isbn,category,total_copies,active,created_at').order('title');
  return { books: data ?? [], error: error?.message ?? null };
};
