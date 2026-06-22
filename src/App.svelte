<script lang="ts">
  import { onMount } from 'svelte'
  import { data, initData } from './lib/stores/data.svelte'
  import Today from './routes/Today.svelte'
  import Program from './routes/Program.svelte'
  import Progress from './routes/Progress.svelte'

  type Tab = 'today' | 'program' | 'progress'
  let active = $state<Tab>('today')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'program', label: 'Program' },
    { id: 'progress', label: 'Progress' },
  ]

  onMount(() => {
    void initData()
  })
</script>

<header class="header">
  <span class="logo">SHRED</span>
  <span class="tag">tracker</span>
</header>

<main class="main">
  {#if !data.ready}
    <div class="loading">Loading…</div>
  {:else if active === 'today'}
    <Today onGoProgram={() => (active = 'program')} />
  {:else if active === 'program'}
    <Program />
  {:else}
    <Progress />
  {/if}
</main>

<nav class="nav">
  {#each tabs as tab (tab.id)}
    <button class="navbtn" class:activebtn={active === tab.id} onclick={() => (active = tab.id)}>
      {tab.label}
    </button>
  {/each}
</nav>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: calc(var(--safe-top) + 14px) 20px 14px;
    background: color-mix(in srgb, var(--bg) 80%, transparent);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .logo {
    font-weight: 900;
    letter-spacing: 0.08em;
    font-size: 20px;
  }
  .tag {
    font-family: var(--font-mono);
    color: var(--text3);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .main {
    padding: 16px 20px;
    padding-bottom: calc(var(--nav-h) + var(--safe-bottom) + 24px);
  }
  .loading {
    text-align: center;
    color: var(--text3);
    padding: 40px 0;
  }

  .nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(var(--nav-h) + var(--safe-bottom));
    padding-bottom: var(--safe-bottom);
    display: flex;
    background: color-mix(in srgb, var(--bg2) 88%, transparent);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--border);
  }
  .navbtn {
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--text3);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .activebtn {
    color: var(--accent2);
  }
</style>
