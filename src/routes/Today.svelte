<script lang="ts">
  import { data } from '../lib/stores/data.svelte'
  import { latestWeight } from '../lib/repo/weights'
  import { WEEK_NUMBERS, weekLabel } from '../lib/program'
  import { weekCompletion, nextWorkout } from '../lib/repo/workouts'
  import DayCard from '../components/DayCard.svelte'

  let { onGoProgram }: { onGoProgram?: () => void } = $props()

  const current = $derived(latestWeight()?.weight ?? null)
  const goal = $derived(data.profile.goalWeight)
  const toGo = $derived(current != null ? Math.round((current - goal) * 10) / 10 : null)

  const next = $derived(nextWorkout())
  let openNext = $state(true)

  const block = $derived.by(() => {
    let done = 0
    let total = 0
    for (const w of WEEK_NUMBERS) {
      const c = weekCompletion(w)
      done += c.done
      total += c.total
    }
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
  })
</script>

{#if next}
  <div class="lead">
    <span class="kicker">Up next · {weekLabel(next.week)}</span>
  </div>
  <DayCard
    day={next.day}
    week={next.week}
    dayIndex={next.dayIndex}
    open={openNext}
    onToggle={() => (openNext = !openNext)}
  />
{:else}
  <div class="card done">
    <span class="big">🎉</span>
    <h2>Block complete!</h2>
    <p>You logged every session in weeks 1–4. Time to run it back heavier.</p>
  </div>
{/if}

<section class="card progress">
  <div class="prow">
    <span class="plabel">Block progress</span>
    <span class="ppct">{block.pct}%</span>
  </div>
  <div class="bar"><div class="fill" style="width:{block.pct}%"></div></div>
  <div class="psub">{block.done} of {block.total} working sets logged</div>
</section>

<section class="row">
  <div class="card mini">
    <span class="num">{current ?? '—'}</span>
    <span class="cap">Current weight</span>
  </div>
  <div class="card mini">
    <span class="num" class:good={toGo != null && toGo <= 0}>{toGo != null && toGo > 0 ? toGo : toGo === null ? '—' : '✓'}</span>
    <span class="cap">To goal ({goal})</span>
  </div>
</section>

<button class="cta" onclick={() => onGoProgram?.()}>Browse full program →</button>

<style>
  .lead {
    margin: 2px 2px 8px;
  }
  .kicker {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent2);
  }
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    margin-bottom: 14px;
  }
  .done {
    text-align: center;
    padding: 28px 20px;
  }
  .done .big {
    font-size: 34px;
  }
  .done h2 {
    margin: 8px 0 6px;
    font-size: 20px;
  }
  .done p {
    color: var(--text2);
    margin: 0;
  }
  .progress {
    padding: 16px 18px;
  }
  .prow {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }
  .plabel {
    font-size: 13px;
    color: var(--text2);
    font-weight: 600;
  }
  .ppct {
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: 800;
    color: var(--accent2);
  }
  .bar {
    height: 8px;
    background: var(--bg);
    border-radius: 999px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    transition: width 0.3s;
  }
  .psub {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text3);
  }
  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .mini {
    text-align: center;
  }
  .mini .num {
    font-family: var(--font-mono);
    font-size: 26px;
    font-weight: 800;
    color: var(--text);
    display: block;
  }
  .mini .num.good {
    color: var(--green);
  }
  .mini .cap {
    font-size: 11px;
    color: var(--text3);
  }
  .cta {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg2);
    color: var(--text2);
    font-weight: 700;
    font-size: 15px;
    padding: 14px;
  }
  .cta:active {
    opacity: 0.85;
  }
</style>
