<script lang="ts">
  import Program from './routes/Program.svelte'

  type Tab = 'today' | 'program' | 'progress'
  let active = $state<Tab>('program')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'program', label: 'Program' },
    { id: 'progress', label: 'Progress' },
  ]
</script>

<header class="header">
  <span class="logo">SHRED</span>
  <span class="tag">tracker</span>
</header>

<main class="main">
  {#if active === 'program'}
    <Program />
  {:else if active === 'today'}
    <div class="placeholder">
      <h2>Today</h2>
      <p>Your current day's workout with per-set logging lands next (M2).</p>
      <p class="hint">For now, browse the full block on the <b>Program</b> tab.</p>
    </div>
  {:else}
    <div class="placeholder">
      <h2>Progress</h2>
      <p>Weight log, charts and milestones are coming in M3–M4.</p>
    </div>
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

  .placeholder {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
  }
  .placeholder h2 {
    margin: 0 0 10px;
    font-size: 20px;
  }
  .placeholder p {
    color: var(--text2);
    line-height: 1.5;
    margin: 0 0 8px;
  }
  .placeholder .hint {
    color: var(--text3);
    font-size: 14px;
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
