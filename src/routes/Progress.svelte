<script lang="ts">
  import { data } from '../lib/stores/data.svelte'
  import { latestWeight } from '../lib/repo/weights'
  import WeightForm from '../components/WeightForm.svelte'
  import WeightTable from '../components/WeightTable.svelte'

  const latest = $derived(latestWeight())
  const current = $derived(latest?.weight ?? null)
  const goal = $derived(data.profile.goalWeight)
  const start = $derived(data.profile.startWeight)
  const lost = $derived(current != null ? Math.round((start - current) * 10) / 10 : null)
  const toGo = $derived(current != null ? Math.round((current - goal) * 10) / 10 : null)
</script>

<section class="stats card">
  <div class="stat">
    <span class="v">{current ?? '—'}</span>
    <span class="l">Current</span>
  </div>
  <div class="stat">
    <span class="v" class:good={lost != null && lost > 0}>{lost ?? '—'}</span>
    <span class="l">Lost</span>
  </div>
  <div class="stat">
    <span class="v">{toGo != null && toGo > 0 ? toGo : toGo === null ? '—' : '✓'}</span>
    <span class="l">To goal ({goal})</span>
  </div>
  <div class="stat">
    <span class="v">{data.weights.length}</span>
    <span class="l">Entries</span>
  </div>
</section>

<section class="card">
  <h3>Log a weigh-in</h3>
  <WeightForm />
</section>

<section class="card">
  <h3>History</h3>
  <WeightTable />
</section>

<p class="soon">📈 Trend &amp; strength charts arrive in the next step.</p>

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
  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    text-align: center;
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .stat .v {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
  }
  .stat .v.good {
    color: var(--green);
  }
  .stat .l {
    font-size: 10px;
    color: var(--text3);
  }
  .soon {
    text-align: center;
    color: var(--text3);
    font-size: 13px;
    margin: 4px 0 0;
  }
</style>
