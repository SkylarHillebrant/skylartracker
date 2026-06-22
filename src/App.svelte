<script lang="ts">
  // M0 shell: proves the build/deploy/install pipeline. Real routes land in M1+.
  type Tab = 'today' | 'program' | 'progress'
  let active = $state<Tab>('today')

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
  <div class="card">
    <h1>Hello, SHRED 👋</h1>
    <p class="muted">
      The rebuild is live. This is the M0 scaffold — Svelte + Vite, deployed to GitHub
      Pages and installable to your home screen.
    </p>
    <p class="muted small">
      Next up: the weeks 9–12 program, then real per-set logging.
    </p>
    <div class="pill">build: M0 · {active}</div>
  </div>
</main>

<nav class="nav" style="--nav-h: 64px;">
  {#each tabs as tab (tab.id)}
    <button
      class="navbtn"
      class:activebtn={active === tab.id}
      onclick={() => (active = tab.id)}
    >
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
    padding: 20px;
    padding-bottom: calc(var(--nav-h) + var(--safe-bottom) + 24px);
  }
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
  }
  h1 {
    margin: 0 0 10px;
    font-size: 26px;
    font-weight: 800;
  }
  .muted {
    color: var(--text2);
    line-height: 1.5;
    margin: 0 0 10px;
  }
  .small {
    font-size: 14px;
    color: var(--text3);
  }
  .pill {
    display: inline-block;
    margin-top: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    color: var(--accent2);
    font-family: var(--font-mono);
    font-size: 12px;
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
