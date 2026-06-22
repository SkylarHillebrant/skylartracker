<script lang="ts">
  import { data } from '../lib/stores/data.svelte'
  import { latestWeight } from '../lib/repo/weights'
  import { WEEK_NUMBERS } from '../lib/program'
  import { weekCompletion } from '../lib/repo/workouts'

  let { onGoProgram }: { onGoProgram?: () => void } = $props()

  const current = $derived(latestWeight()?.weight ?? null)
  const goal = $derived(data.profile.goalWeight)
  const toGo = $derived(current != null ? Math.round((current - goal) * 10) / 10 : null)

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

<section class="hero card">
  <div class="big">
    <span class="num">{block.pct}%</span>
    <span class="cap">Block complete</span>
  </div>
  <div class="bar"><div class="fill" style="width:{block.pct}%"></div></div>
  <div class="sub">{block.done} of {block.total} sets logged this block (weeks 1–4)</div>
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

<button class="cta" onclick={() => onGoProgram?.()}>Log a workout →</button>

<style>
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 14px;
  }
  .hero {
    text-align: center;
  }
  .big {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 14px;
  }
  .num {
    font-family: var(--font-mono);
    font-size: 40px;
    font-weight: 800;
    color: var(--accent2);
    line-height: 1;
  }
  .cap {
    font-size: 12px;
    color: var(--text3);
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
  .sub {
    margin-top: 10px;
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
    font-size: 26px;
  }
  .mini .num.good {
    color: var(--green);
  }
  .cta {
    width: 100%;
    border: 0;
    border-radius: var(--radius);
    background: var(--accent);
    color: #06122a;
    font-weight: 800;
    font-size: 16px;
    padding: 15px;
  }
  .cta:active {
    opacity: 0.85;
  }
</style>
