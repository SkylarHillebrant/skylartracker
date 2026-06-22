<script lang="ts">
  import type { Exercise, WeekNumber } from '../lib/types'
  import { isNumericSection, isToggleSection, parseSets, getSet, toggleDone } from '../lib/repo/workouts'
  import SetLogRow from './SetLogRow.svelte'

  let {
    ex,
    week,
    dayIndex,
    sectionIndex,
    exerciseIndex,
    sectionType,
  }: {
    ex: Exercise
    week: WeekNumber
    dayIndex: number
    sectionIndex: number
    exerciseIndex: number
    sectionType: string
  } = $props()

  const numeric = $derived(isNumericSection(sectionType))
  const toggle = $derived(isToggleSection(sectionType))
  const sets = $derived(numeric ? parseSets(ex.r) : 0)

  const base = $derived({
    week,
    dayIndex,
    sectionIndex,
    exerciseIndex,
    setIndex: 0,
    exerciseName: ex.n,
    targetReps: ex.r,
  })
  const toggleDoneState = $derived(getSet(week, dayIndex, sectionIndex, exerciseIndex, 0)?.completed ?? false)
</script>

{#if ex.n === ''}
  <div class="noteline">{ex.note}</div>
{:else}
  <div class="ex">
    <div class="head">
      <div class="title">
        <span class="name">{ex.n}</span>
        {#if ex.note}<span class="note">{ex.note}</span>{/if}
      </div>
      {#if ex.r}<span class="target">{ex.r}</span>{/if}
      {#if toggle}
        <button class="tdone" class:on={toggleDoneState} onclick={() => toggleDone(base)} aria-label="Mark done">✓</button>
      {/if}
    </div>

    {#if numeric}
      <div class="sets">
        {#each Array.from({ length: sets }) as _, k (k)}
          <SetLogRow
            {week}
            {dayIndex}
            {sectionIndex}
            {exerciseIndex}
            setIndex={k}
            exerciseName={ex.n}
            targetReps={ex.r}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .ex {
    padding: 10px 0;
    border-top: 1px solid var(--border);
  }
  .head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .title {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }
  .name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .note {
    font-size: 12px;
    color: var(--text3);
    line-height: 1.35;
  }
  .target {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    color: var(--accent2);
    white-space: nowrap;
    padding-top: 1px;
  }
  .tdone {
    flex: 0 0 34px;
    height: 30px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text3);
    font-size: 14px;
  }
  .tdone.on {
    background: color-mix(in srgb, var(--green) 22%, transparent);
    border-color: var(--green);
    color: var(--green);
  }
  .sets {
    margin-top: 6px;
  }
  .noteline {
    padding: 8px 0;
    border-top: 1px solid var(--border);
    font-size: 12px;
    font-style: italic;
    color: var(--text3);
  }
</style>
