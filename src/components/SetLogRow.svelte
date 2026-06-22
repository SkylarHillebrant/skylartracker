<script lang="ts">
  import { untrack } from 'svelte'
  import { getSet, updateSet, lastLoggedFor } from '../lib/repo/workouts'
  import type { WeekNumber } from '../lib/types'

  let {
    week,
    dayIndex,
    sectionIndex,
    exerciseIndex,
    setIndex,
    exerciseName,
    targetReps,
  }: {
    week: WeekNumber
    dayIndex: number
    sectionIndex: number
    exerciseIndex: number
    setIndex: number
    exerciseName: string
    targetReps: string
  } = $props()

  const prefill = $derived(lastLoggedFor(exerciseName))

  // Seed local input state once from any existing log (untracked = initial value).
  const seed = untrack(() => getSet(week, dayIndex, sectionIndex, exerciseIndex, setIndex))
  let weightStr = $state(seed?.weight != null ? String(seed.weight) : '')
  let repsStr = $state(seed?.reps != null ? String(seed.reps) : '')
  let rpeStr = $state(seed?.rpe != null ? String(seed.rpe) : '')

  // `completed` is read from the store so completion % stays reactive.
  const done = $derived(getSet(week, dayIndex, sectionIndex, exerciseIndex, setIndex)?.completed ?? false)

  const base = $derived({ week, dayIndex, sectionIndex, exerciseIndex, setIndex, exerciseName, targetReps })
  const toNum = (s: string): number | null => {
    const n = parseFloat(s)
    return Number.isNaN(n) ? null : n
  }

  function push() {
    updateSet({ ...base, patch: { weight: toNum(weightStr), reps: toNum(repsStr), rpe: toNum(rpeStr) } })
  }
  function toggle() {
    updateSet({ ...base, patch: { completed: !done } })
  }
</script>

<div class="setrow" class:done>
  <span class="no">{setIndex + 1}</span>
  <input
    class="inp"
    type="number"
    inputmode="decimal"
    placeholder={prefill?.weight != null ? String(prefill.weight) : 'wt'}
    bind:value={weightStr}
    oninput={push}
  />
  <span class="x">×</span>
  <input
    class="inp"
    type="number"
    inputmode="numeric"
    placeholder={prefill?.reps != null ? String(prefill.reps) : 'reps'}
    bind:value={repsStr}
    oninput={push}
  />
  <input class="inp rpe" type="number" inputmode="decimal" placeholder="rpe" bind:value={rpeStr} oninput={push} />
  <button class="done" class:on={done} onclick={toggle} aria-label="Mark set done">✓</button>
</div>

<style>
  .setrow {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 0;
  }
  .no {
    width: 16px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text3);
    flex-shrink: 0;
  }
  .inp {
    width: 100%;
    min-width: 0;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    padding: 8px 6px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 15px;
  }
  .inp:focus {
    outline: none;
    border-color: var(--accent);
  }
  .rpe {
    flex: 0 0 48px;
    color: var(--text2);
  }
  .x {
    color: var(--text3);
    font-size: 12px;
    flex-shrink: 0;
  }
  .done {
    flex: 0 0 36px;
    height: 34px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text3);
    font-size: 15px;
    line-height: 1;
  }
  .done.on {
    background: color-mix(in srgb, var(--green) 22%, transparent);
    border-color: var(--green);
    color: var(--green);
  }
  .setrow.done .inp {
    border-color: color-mix(in srgb, var(--green) 35%, var(--border));
  }
</style>
