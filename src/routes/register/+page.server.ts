
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();

  if (user) {
    throw redirect(303, '/dashboard');
  }

  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();

    const fullName = String(form.get('full_name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const confirmPassword = String(form.get('confirm_password') ?? '');

    if (!fullName || !email || !password || !confirmPassword) {
      return fail(400, {
        error: 'Please complete all fields.',
        fullName,
        email
      });
    }

    if (fullName.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return fail(400, {
        error: 'Enter a valid name and email address.',
        fullName,
        email
      });
    }

    if (password.length < 8) {
      return fail(400, {
        error: 'Your password must contain at least 8 characters.',
        fullName,
        email
      });
    }

    if (password !== confirmPassword) {
      return fail(400, {
        error: 'Passwords do not match.',
        fullName,
        email
      });
    }

    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      if (error.code === 'email_exists' || error.code === 'user_already_exists') {
        return fail(400, {
          error: 'An account with this email address already exists. Sign in instead.',
          fullName,
          email
        });
      }

      return fail(400, {
        error: 'Unable to create your account. Check your email and password, then try again.',
        fullName,
        email
      });
    }

    if (!data.user) {
      return fail(500, {
        error: 'Your account could not be verified. Please try again or contact support.',
        fullName,
        email
      });
    }

    if (data.user.identities?.length === 0) {
      return fail(400, {
        error: 'An account with this email address already exists. Sign in instead.',
        fullName,
        email
      });
    }

    if (data.session) {
      throw redirect(303, '/dashboard');
    }

    return {
      success: 'Your account was created. Check your email to confirm your address before signing in.'
    };
  }
};
