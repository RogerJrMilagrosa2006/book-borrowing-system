import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/login');
  const { data: profile } = await locals.supabase.from('profiles').select('active, role').eq('id', user.id).maybeSingle();
  if (!profile?.active || !['admin', 'librarian'].includes(profile.role)) throw redirect(303, '/login');

  const today = new Date().toISOString().slice(0, 10);
  const [books, borrowers, activeLoans, overdueLoans, recent] = await Promise.all([
    locals.supabase.from('books').select('id,total_copies,active'),
    locals.supabase.from('borrowers').select('id', { count: 'exact', head: true }).eq('active', true),
    locals.supabase.from('borrowings').select('id', { count: 'exact', head: true }).is('returned_at', null),
    locals.supabase.from('borrowings').select('id', { count: 'exact', head: true }).is('returned_at', null).lt('due_date', today),
    locals.supabase.from('borrowings').select('id,borrowed_at,due_date,returned_at,books(title),borrowers(full_name)').order('borrowed_at', { ascending: false }).limit(6)
  ]);
  const bookRows = books.data ?? [];
  return {
    stats: {
      titles: bookRows.filter((b) => b.active).length,
      copies: bookRows.filter((b) => b.active).reduce((n, b) => n + b.total_copies, 0),
      borrowers: borrowers.count ?? 0,
      activeLoans: activeLoans.count ?? 0,
      overdue: overdueLoans.count ?? 0
    },
    recent: recent.data ?? [],
    today
  };
};
