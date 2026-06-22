<script lang="ts">
  import { data } from '../lib/stores/data.svelte'
  import { latestWeight } from '../lib/repo/weights'
  import { weekCompletion, strengthBests } from '../lib/repo/workouts'
  import { WEEK_NUMBERS, weekLabel } from '../lib/program'
  import { MILESTONES, isHit } from '../lib/milestones'
  import WeightForm from '../components/WeightForm.svelte'
  import WeightTable from '../components/WeightTable.svelte'
  import LineChart from '../components/LineChart.svelte'

  const latest = $derived(latestWeight())
  const current = $derived(latest?.weight ?? null)
  const goal = $derived(data.profile.goalWeight)
  const start = $derived(data.profile.startWeight)
  const lost = $derived(current != null ? Math.round((start - current) * 10) / 10 : null)
  const toGo = $derived(current != null ? Math.round((current - goal) * 10) / 10 : null)

  // Weight series oldest → newest for the trend chart.
  const series = $derived(
    [...data.weights]
      .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
      .map((w) => ({ x: Date.parse(w.entryDate), y: w.weight })),
  )

  const weeks = $derived(WEEK_NUMBERS.map((w) => ({ w, pct: weekCompletion(w).pct })))
  const bests = $derived(strengthBests())
</script>

<section class="stats card">
  <div class="stat"><span class="v">{current ?? '—'}</span><span class="l">Current</span></div>
  <div class="stat"><span class="v" class:good={lost != null && lost > 0}>{lost ?? '—'}</span><span class="l">Lost</span></div>
  <div class="stat"><span class="v">{toGo != null && toGo > 0 ? toGo : toGo === null ? '—' : '✓'}</span><span class="l">To goal ({goal})</span></div>
  <div class="stat"><span class="v">{data.weights.length}</span><span class="l">Entries</span></div>
</section>

<section class="card">
  <h3>Weight trend <span class="hint">· goal {goal} (dashed)</span></h3>
  <LineChart points={series} {goal} />
</section>

<section class="card">
  <h3>Milestones</h3>
  <div class="miles">
    {#each MILESTONES as m (m.date)}
      {@const hit = isHit(m.target, current)}
      <div class="mile" class:hit>
        <span class="mk">{hit ? '✓' : '○'}</span>
        <span class="ml">{m.label}</span>
        <span class="mt">{m.target} lb</span>
      </div>
    {/each}
  </div>
</section>

<section class="card">
  <h3>Weekly completion</h3>
  <div class="weeks">
    {#each weeks as wk (wk.w)}
      <div class="wcol">
        <div class="track"><div class="bar" style="height:{Math.max(wk.pct, 2)}%"></div></div>
        <span class="wpct">{wk.pct}%</span>
        <span class="wlbl">{weekLabel(wk.w).replace('Week ', 'W').replace('W11 Peak', 'W11').replace('W12 Deload', 'W12')}</span>
      </div>
    {/each}
  </div>
</section>

{#if bests.length}
  <section class="card">
    <h3>Strength — best logged</h3>
    <div class="bests">
      {#each bests as b (b.name)}
        <div class="best">
          <span class="bn">{b.name}</span>
          <span class="bw">{b.weight}<small> lb{b.reps ? ` × ${b.reps}` : ''}</small></span>
        </div>
      {/each}
    </div>
  </section>
{/if}

<section class="card">
  <h3>Log a weigh-in</h3>
  <WeightForm />
</section>

<section class="card">
  <h3>History</h3>
  <WeightTable />
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
  .hint {
    font-weight: 400;
    color: var(--text3);
    font-size: 12px;
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

  .miles {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .mile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-top: 1px solid var(--border);
  }
  .mile:first-child {
    border-top: 0;
  }
  .mk {
    color: var(--text3);
    width: 16px;
    text-align: center;
  }
  .mile.hit .mk {
    color: var(--green);
  }
  .ml {
    flex: 1;
    font-size: 14px;
    color: var(--text);
  }
  .mile.hit .ml {
    color: var(--text2);
  }
  .mt {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent2);
  }

  .weeks {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    align-items: end;
  }
  .wcol {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .track {
    width: 100%;
    height: 90px;
    background: var(--bg);
    border-radius: 8px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }
  .bar {
    width: 100%;
    background: linear-gradient(180deg, var(--accent2), var(--accent));
    border-radius: 8px 8px 0 0;
    transition: height 0.3s;
  }
  .wpct {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text2);
  }
  .wlbl {
    font-size: 11px;
    color: var(--text3);
  }

  .bests {
    display: flex;
    flex-direction: column;
  }
  .best {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    padding: 9px 0;
    border-top: 1px solid var(--border);
  }
  .best:first-child {
    border-top: 0;
  }
  .bn {
    font-size: 14px;
    color: var(--text);
  }
  .bw {
    font-family: var(--font-mono);
    font-size: 15px;
    font-weight: 700;
    color: var(--accent2);
    white-space: nowrap;
  }
  .bw small {
    color: var(--text3);
    font-weight: 400;
    font-size: 11px;
  }
</style>
