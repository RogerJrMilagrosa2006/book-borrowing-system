import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/login');
  const { data: profile } = await locals.supabase.from('profiles').select('active,role').eq('id', user.id).maybeSingle();
  if (!profile?.active || profile.role !== 'librarian') throw redirect(303, '/login');
  const today = new Date().toISOString().slice(0,10);
  const { data, error } = await locals.supabase.from('borrowings').select('id,borrowed_at,due_date,notes,books(title,author,isbn),borrowers(full_name,student_id,email,phone)').is('returned_at',null).order('due_date');
  return { loans: data ?? [], today, error: error?.message ?? null };
};
