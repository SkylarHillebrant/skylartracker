<script lang="ts">
  import type { Exercise, WeekNumber } from '../lib/types'
  import { isNumericSection, isToggleSection, getSet, toggleDone, setDone } from '../lib/repo/workouts'
  import { setCount, prescription } from '../lib/logic'
  import { data } from '../lib/stores/data.svelte'

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
  const sets = $derived(numeric ? setCount(ex) : 0)
  const presc = $derived(prescription(ex, data.maxes))
  const needsMax = $derived(Boolean(ex.lift && ex.pct != null && presc.includes('set your')))

  const toggleState = $derived(getSet(week, dayIndex, sectionIndex, exerciseIndex, 0)?.completed ?? false)
  const base = $derived({ week, dayIndex, sectionIndex, exerciseIndex, setIndex: 0, exerciseName: ex.n, targetReps: ex.r })

  function pipDone(k: number): boolean {
    return getSet(week, dayIndex, sectionIndex, exerciseIndex, k)?.completed ?? false
  }
  function tapPip(k: number) {
    setDone({ week, dayIndex, sectionIndex, exerciseIndex, setIndex: k, ex, maxes: data.maxes })
  }
  function lookUp() {
    // Strip parentheticals / qualifiers for a cleaner query, then open a demo search.
    const q = ex.n.replace(/\(.*?\)/g, '').replace(/—.*$/, '').trim()
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent('how to ' + q)}`
    window.open(url, '_blank', 'noopener')
  }
</script>

{#if ex.n === ''}
  <div class="noteline">{ex.note}</div>
{:else}
  <div class="ex">
    <div class="head">
      <div class="title">
        <span class="nameline">
          <span class="name">{ex.n}</span>
          <button class="search" onclick={lookUp} aria-label={`Look up ${ex.n}`}>🔍</button>
        </span>
        {#if ex.note}<span class="note">{ex.note}</span>{/if}
      </div>
      <span class="presc" class:warn={needsMax}>{presc}</span>
      {#if toggle}
        <button class="tdone" class:on={toggleState} onclick={() => toggleDone(base)} aria-label="Mark done">✓</button>
      {/if}
    </div>

    {#if numeric}
      <div class="pips">
        {#each Array.from({ length: sets }) as _, k (k)}
          <button class="pip" class:done={pipDone(k)} onclick={() => tapPip(k)} aria-label={`Set ${k + 1}`}>
            {k + 1}
          </button>
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
  .nameline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .search {
    border: 0;
    background: transparent;
    padding: 0 2px;
    font-size: 12px;
    line-height: 1;
    opacity: 0.55;
    flex-shrink: 0;
  }
  .search:active {
    opacity: 1;
  }
  .note {
    font-size: 12px;
    color: var(--text3);
    line-height: 1.35;
  }
  .presc {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
    color: var(--accent2);
    white-space: nowrap;
    padding-top: 1px;
  }
  .presc.warn {
    color: var(--red);
    font-size: 11px;
    white-space: normal;
    text-align: right;
    max-width: 130px;
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
  .pips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
  .pip {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text3);
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
  }
  .pip.done {
    background: var(--accent);
    border-color: var(--accent);
    color: #06122a;
  }
  .noteline {
    padding: 8px 0;
    border-top: 1px solid var(--border);
    font-size: 12px;
    font-style: italic;
    color: var(--text3);
  }
</style>
