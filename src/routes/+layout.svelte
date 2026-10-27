<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { createBrowserClient } from '@supabase/ssr';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
  import { BookOpen, LayoutDashboard, Users, ArrowLeftRight, AlertTriangle, LogOut, Menu, X, LibraryBig } from 'lucide-svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
  let mobileOpen = false;
  const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/books', label: 'Books', icon: BookOpen },
    { href: '/borrowers', label: 'Borrowers', icon: Users },
    { href: '/borrowings', label: 'Borrowing records', icon: ArrowLeftRight },
    { href: '/unreturned', label: 'Unreturned books', icon: AlertTriangle }
  ];

  async function logout() {
    await supabase.auth.signOut();
    await goto('/login');
  }
</script>

<svelte:head><title>LibraryDesk | Book Borrowing System</title><meta name="description" content="Library book borrowing management system" /></svelte:head>

{#if $page.url.pathname === '/login'}
  <slot />
{:else if !data.user}
  <div class="min-h-screen grid place-items-center bg-slate-50 p-6">
    <div class="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <LibraryBig class="mx-auto mb-4 h-10 w-10 text-indigo-600" />
      <h1 class="text-xl font-bold text-slate-900">LibraryDesk</h1>
      <p class="mt-2 text-sm text-slate-500">Please sign in to access the library management system.</p>
      <a class="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700" href="/login">Go to login</a>
    </div>
  </div>
{:else if !data.profile || !data.profile.active || !['admin', 'librarian'].includes(data.profile.role)}
  <div class="min-h-screen grid place-items-center bg-slate-50 p-6">
    <div class="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
      <h1 class="text-xl font-bold">Account not authorized</h1>
      <p class="mt-2 text-sm text-slate-600">Your account does not have an active librarian/admin profile. Ask the system administrator to assign your role.</p>
      <button class="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-white" on:click={logout}>Sign out</button>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-slate-50 lg:flex">
    {#if mobileOpen}
      <button aria-label="Close navigation" class="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" on:click={() => mobileOpen = false}></button>
    {/if}
    <aside class:translate-x-0={mobileOpen} class="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0">
      <div class="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><LibraryBig size={22} /></div>
        <div><div class="font-bold tracking-tight text-slate-900">LibraryDesk</div><div class="text-xs text-slate-500">Borrowing management</div></div>
        <button class="ml-auto lg:hidden" aria-label="Close menu" on:click={() => mobileOpen = false}><X size={19}/></button>
      </div>
      <div class="px-4 pt-6 text-[11px] font-bold uppercase tracking-[.15em] text-slate-400">Workspace</div>
      <nav class="mt-3 flex-1 space-y-1 px-3">
        {#each nav as item}
          <a href={item.href} on:click={() => mobileOpen = false} class:nav-active={$page.url.pathname.startsWith(item.href)} class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700">
            <svelte:component this={item.icon} size={19} />
            <span>{item.label}</span>
          </a>
        {/each}
      </nav>
      <div class="m-3 rounded-2xl bg-slate-50 p-4">
        <div class="text-xs text-slate-500">Signed in as</div>
        <div class="mt-1 truncate text-sm font-semibold text-slate-800">{data.profile.full_name || data.user.email}</div>
        <div class="mt-1 inline-flex rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-semibold capitalize text-indigo-700">{data.profile.role}</div>
        <button on:click={logout} class="mt-4 flex w-full items-center gap-2 text-sm font-medium text-slate-500 hover:text-rose-600"><LogOut size={16}/> Sign out</button>
      </div>
    </aside>

    <main class="min-w-0 flex-1">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7">
        <div class="flex items-center gap-3">
          <button class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu" on:click={() => mobileOpen = true}><Menu size={20}/></button>
          <div><div class="text-sm font-semibold text-slate-900">{nav.find(n => $page.url.pathname.startsWith(n.href))?.label ?? 'Library dashboard'}</div><div class="hidden text-xs text-slate-500 sm:block">Manage your library operations</div></div>
        </div>
        <div class="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex"><span class="h-2 w-2 rounded-full bg-emerald-500"></span> System online</div>
      </header>
      <div class="mx-auto max-w-[1600px] p-4 sm:p-7"><slot /></div>
    </main>
  </div>
{/if}

<style>
  :global(.nav-active) { background: #eef2ff; color: #4338ca; }
</style>
