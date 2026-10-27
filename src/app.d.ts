import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from './lib/database.types';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      safeGetSession: () => Promise<{ user: User | null; session: Session | null }>;
    }
    interface PageData {
      user?: User | null;
      profile?: { id: string; full_name: string; role: 'admin' | 'librarian'; active: boolean } | null;
    }
  }
}
export {};
