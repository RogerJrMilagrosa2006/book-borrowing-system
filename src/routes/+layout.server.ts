import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('id, full_name, role, active')
    .eq('id', user.id)
    .maybeSingle();

  return { user, profile };
};
