import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/login');
  const { data: profile } = await locals.supabase.from('profiles').select('active,role').eq('id', user.id).maybeSingle();
  if (!profile?.active || !['admin','librarian'].includes(profile.role)) throw redirect(303, '/login');
  const { data, error } = await locals.supabase.from('borrowers').select('id,full_name,student_id,email,phone,active,created_at').order('full_name');
  return { borrowers: data ?? [], error: error?.message ?? null };
};
