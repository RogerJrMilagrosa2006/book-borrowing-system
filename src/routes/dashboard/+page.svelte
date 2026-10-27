<script lang="ts">
  import { BookOpen, Users, ArrowLeftRight, AlertTriangle, LibraryBig, ArrowUpRight, Clock3 } from 'lucide-svelte';
  export let data;
  const cards = [
    { label: 'Active titles', key: 'titles', icon: BookOpen, tone: 'bg-indigo-50 text-indigo-700', note: 'Book records' },
    { label: 'Total copies', key: 'copies', icon: LibraryBig, tone: 'bg-sky-50 text-sky-700', note: 'In active inventory' },
    { label: 'Active borrowers', key: 'borrowers', icon: Users, tone: 'bg-emerald-50 text-emerald-700', note: 'Registered borrowers' },
    { label: 'Books on loan', key: 'activeLoans', icon: ArrowLeftRight, tone: 'bg-amber-50 text-amber-700', note: 'Not yet returned' },
    { label: 'Overdue loans', key: 'overdue', icon: AlertTriangle, tone: 'bg-rose-50 text-rose-700', note: 'Past due date' }
  ] as const;
  function date(value: string) { return new Date(value + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
</script>

<div class="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
  <div><p class="text-sm font-medium text-indigo-600">OVERVIEW</p><h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-900">Library dashboard</h1><p class="mt-2 text-sm text-slate-500">Here is what is happening with your library today.</p></div>
  <a href="/borrowings" class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Manage borrowing <ArrowUpRight size={16}/></a>
</div>

<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
  {#each cards as card}
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-start justify-between"><div class={`grid h-11 w-11 place-items-center rounded-xl ${card.tone}`}><svelte:component this={card.icon} size={21}/></div><span class="text-xs font-medium text-slate-400">Overview</span></div>
      <div class="mt-5 text-3xl font-bold tracking-tight text-slate-900">{data.stats[card.key]}</div>
      <div class="mt-1 font-semibold text-slate-700">{card.label}</div><div class="mt-1 text-xs text-slate-500">{card.note}</div>
    </div>
  {/each}
</div>

<div class="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 class="font-bold text-slate-900">Recent borrowing activity</h2><p class="mt-1 text-xs text-slate-500">Latest recorded transactions</p></div><Clock3 size={19} class="text-slate-400"/></div>
  {#if data.recent.length}
    <div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="px-5 py-3 font-semibold">Book</th><th class="px-5 py-3 font-semibold">Borrower</th><th class="px-5 py-3 font-semibold">Borrowed</th><th class="px-5 py-3 font-semibold">Status</th></tr></thead><tbody class="divide-y divide-slate-100">
      {#each data.recent as loan}
        <tr class="hover:bg-slate-50/70"><td class="px-5 py-4 font-semibold text-slate-800">{loan.books?.title ?? 'Unknown book'}</td><td class="px-5 py-4 text-slate-600">{loan.borrowers?.full_name ?? 'Unknown borrower'}</td><td class="px-5 py-4 text-slate-600">{date(loan.borrowed_at)}</td><td class="px-5 py-4">{#if loan.returned_at}<span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Returned</span>{:else if loan.due_date < data.today}<span class="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">Overdue</span>{:else}<span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Borrowed</span>{/if}</td></tr>
      {/each}
    </tbody></table></div>
  {:else}
    <div class="p-10 text-center"><div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><BookOpen size={22}/></div><h3 class="mt-3 font-semibold text-slate-800">No borrowing records yet</h3><p class="mt-1 text-sm text-slate-500">When a book is issued, it will appear here.</p><a href="/borrowings" class="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-800">Create a borrowing record →</a></div>
  {/if}
</div>
