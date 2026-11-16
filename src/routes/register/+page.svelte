
<script lang="ts">
  import { enhance } from '$app/forms';
  import { LibraryBig, BookOpen, UserPlus } from 'lucide-svelte';

  export let form;
</script>

<svelte:head>
  <title>Create Account | LibraryDesk</title>
</svelte:head>

<div class="grid min-h-[calc(100vh-3rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">

  <section class="relative hidden flex-col justify-between overflow-hidden bg-indigo-700 p-12 text-white lg:flex">
    <div class="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/50 blur-2xl"></div>

    <div class="relative flex items-center gap-3">
      <div class="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
        <LibraryBig size={24}/>
      </div>
      <div class="text-xl font-bold">LibraryDesk</div>
    </div>

    <div class="relative max-w-lg">
      <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
        <UserPlus size={15}/> LIBRARIAN REGISTRATION
      </div>

      <h1 class="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
        Your library.<br/>
        Your collection.<br/>
        <span class="text-indigo-200">Your workspace.</span>
      </h1>

      <p class="mt-5 max-w-md leading-7 text-indigo-100">
        Create your own LibraryDesk account and manage your books, borrowers, and borrowing records.
      </p>
    </div>

    <div class="relative flex items-center gap-2 text-xs text-indigo-200">
      <BookOpen size={15}/> Book Borrowing Management System
    </div>
  </section>

  <section class="flex items-center justify-center p-6 sm:p-12">
    <div class="w-full max-w-md">

      <div class="mb-8 flex items-center gap-3 lg:hidden">
        <div class="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white">
          <LibraryBig size={23}/>
        </div>
        <span class="text-xl font-bold">LibraryDesk</span>
      </div>

      <div class="text-sm font-semibold text-indigo-600">GET STARTED</div>

      <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Create your account
      </h2>

      <p class="mt-3 text-sm leading-6 text-slate-500">
        Register as a Librarian to create your own library workspace.
      </p>

      {#if form?.error}
        <div role="alert" class="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {form.error}
        </div>
      {/if}

      {#if form?.success}
        <div role="status" class="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {form.success}
        </div>
      {/if}

      <form method="POST" use:enhance class="mt-8 space-y-5">

        <div>
          <label for="full_name" class="mb-2 block text-sm font-semibold text-slate-700">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autocomplete="name"
            required
            value={form?.fullName ?? ''}
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label for="email" class="mb-2 block text-sm font-semibold text-slate-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            value={form?.email ?? ''}
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label for="confirm_password" class="mb-2 block text-sm font-semibold text-slate-700">
            Confirm password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            placeholder="Enter your password again"
          />
        </div>

        <button
          type="submit"
          class="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200"
        >
          Create account
        </button>

      </form>

      <p class="mt-6 text-center text-sm text-slate-500">
        Already have an account?
        <a href="/login" class="font-semibold text-indigo-600 hover:text-indigo-700">
          Sign in
        </a>
      </p>

    </div>
  </section>
</div>
