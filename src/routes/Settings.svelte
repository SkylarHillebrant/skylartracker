<script lang="ts">
  import { untrack } from 'svelte'
  import { session, signOut } from '../lib/stores/session.svelte'
  import { sync, flush } from '../lib/offline/sync.svelte'
  import { importLegacyWeights } from '../lib/migrate'
  import { data, setMaxes } from '../lib/stores/data.svelte'
  import { setGoalWeight } from '../lib/repo/profile'
  import SignIn from '../components/SignIn.svelte'

  let importMsg = $state('')
  let importing = $state(false)

  const seed = (n: number | undefined) => (n ? String(n) : '')
  let benchInput = $state(seed(untrack(() => data.maxes.bench)))
  let squatInput = $state(seed(untrack(() => data.maxes.squat)))
  let deadliftInput = $state(seed(untrack(() => data.maxes.deadlift)))
  let maxSaved = $state(false)
  function saveMaxes() {
    const p = (s: string) => {
      const n = parseFloat(s)
      return Number.isNaN(n) || n <= 0 ? undefined : n
    }
    void setMaxes({ bench: p(benchInput), squat: p(squatInput), deadlift: p(deadliftInput) })
    maxSaved = true
    setTimeout(() => (maxSaved = false), 1500)
  }

  let goalInput = $state(String(untrack(() => data.profile.goalWeight)))
  let goalSaved = $state(false)
  function saveGoal() {
    const g = parseFloat(goalInput)
    if (Number.isNaN(g) || g <= 0) return
    setGoalWeight(g)
    goalSaved = true
    setTimeout(() => (goalSaved = false), 1500)
  }

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
  <h3>Your 1-rep maxes</h3>
  <p class="muted">Every working weight is computed from these. Update anytime — your sets re-calculate instantly. Incline is estimated from your bench.</p>
  <div class="maxgrid">
    <label><span>Bench</span><input type="number" inputmode="decimal" bind:value={benchInput} placeholder="—" /></label>
    <label><span>Squat</span><input type="number" inputmode="decimal" bind:value={squatInput} placeholder="—" /></label>
    <label><span>Deadlift</span><input type="number" inputmode="decimal" bind:value={deadliftInput} placeholder="—" /></label>
  </div>
  <button class="btn" onclick={saveMaxes}>{maxSaved ? 'Saved ✓' : 'Save maxes'}</button>
</section>

<section class="card">
  <h3>Goals</h3>
  <p class="muted">Bench press target: <b>275 lb</b> · primary focus. Weight goal is secondary:</p>
  <div class="goalrow">
    <input type="number" inputmode="decimal" bind:value={goalInput} aria-label="Goal weight" />
    <span class="unit">lb</span>
    <button class="btn" onclick={saveGoal}>{goalSaved ? 'Saved ✓' : 'Save goal'}</button>
  </div>
</section>

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
  .maxgrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 12px;
  }
  .maxgrid label {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .maxgrid label span {
    font-size: 11px;
    color: var(--text3);
  }
  .maxgrid input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    padding: 10px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 16px;
  }
  .maxgrid input:focus {
    outline: none;
    border-color: var(--accent);
  }
  .goalrow {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .goalrow input {
    width: 90px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    padding: 10px 12px;
    font-family: var(--font-mono);
  }
  .goalrow input:focus {
    outline: none;
    border-color: var(--accent);
  }
  .unit {
    color: var(--text3);
    font-size: 13px;
    margin-right: auto;
  }
</style>
