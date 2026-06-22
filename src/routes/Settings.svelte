<script lang="ts">
  import { session, signOut } from '../lib/stores/session.svelte'
  import { sync, flush } from '../lib/offline/sync'
  import { importLegacyWeights } from '../lib/migrate'
  import { data } from '../lib/stores/data.svelte'
  import SignIn from '../components/SignIn.svelte'

  let importMsg = $state('')
  let importing = $state(false)

  async function runImport() {
    importing = true
    const r = await importLegacyWeights(true)
    importing = false
    importMsg =
      r.imported > 0
        ? `Imported ${r.imported} weigh-in${r.imported === 1 ? '' : 's'}${r.skipped ? ` (${r.skipped} already present)` : ''}.`
        : `Nothing new to import${r.skipped ? ` (${r.skipped} already present)` : ''}.`
  }

  const lastSynced = $derived(
    sync.lastSyncedAt ? new Date(sync.lastSyncedAt).toLocaleString() : 'not yet',
  )
</script>

<section class="card">
  <h3>Cloud backup &amp; sync</h3>
  {#if !session.configured}
    <p class="muted">Cloud sync isn't set up yet. Your data is saved on this device only.</p>
  {:else if session.userId}
    <p class="muted">Signed in as <b>{session.email}</b></p>
    <div class="syncline">
      <span>{sync.pending > 0 ? `${sync.pending} change(s) queued` : 'All changes synced'}</span>
      <span class="dim">Last sync: {lastSynced}</span>
    </div>
    <div class="btnrow">
      <button class="btn" onclick={() => flush()} disabled={sync.syncing}>Sync now</button>
      <button class="btn ghost" onclick={() => signOut()}>Sign out</button>
    </div>
  {:else}
    <p class="muted">Sign in to back up your data and sync across devices.</p>
    <SignIn />
  {/if}
</section>

<section class="card">
  <h3>Data</h3>
  <p class="muted">Import your weight history from the old tracker (safe to run anytime — duplicates are skipped).</p>
  <button class="btn" onclick={runImport} disabled={importing}>
    {importing ? 'Importing…' : 'Import old weight history'}
  </button>
  {#if importMsg}<p class="result">{importMsg}</p>{/if}
  <p class="dim">Goal {data.profile.goalWeight} lb · Start {data.profile.startWeight} lb · {data.weights.length} weigh-ins stored</p>
</section>

<style>
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    margin-bottom: 14px;
  }
  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 700;
    color: var(--text2);
  }
  .muted {
    color: var(--text2);
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 12px;
  }
  .syncline {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--text2);
    margin-bottom: 12px;
  }
  .dim {
    color: var(--text3);
    font-size: 12px;
  }
  .btnrow {
    display: flex;
    gap: 10px;
  }
  .btn {
    border: 1px solid var(--accent);
    border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--text);
    font-weight: 700;
    padding: 10px 14px;
  }
  .btn.ghost {
    background: transparent;
    border-color: var(--border);
    color: var(--text2);
  }
  .btn:disabled {
    opacity: 0.6;
  }
  .result {
    color: var(--accent2);
    font-size: 13px;
    margin: 10px 0 0;
  }
</style>
