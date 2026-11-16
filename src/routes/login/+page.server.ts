import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (user) throw redirect(303, '/dashboard');
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    if (!email || !password) return { error: 'Enter your email and password.' };

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Unable to sign in. Check your email and password, and confirm your email address if prompted.' };

    const { user } = await locals.safeGetSession();
    if (!user) return { error: 'Login succeeded but the session could not be verified. Please try again.' };

    const { data: profile } = await locals.supabase.from('profiles').select('active, role').eq('id', user.id).maybeSingle();
    if (!profile || !profile.active || profile.role !== 'librarian') {
      await locals.supabase.auth.signOut();
      return { error: 'This account does not have an active librarian profile. Please contact support.' };
    }
    throw redirect(303, '/dashboard');
  }
};
