<script lang="ts">
  import { untrack } from 'svelte'
  import { PROGRAM, WEEK_NUMBERS, weekLabel } from '../lib/program'
  import { weekCompletion } from '../lib/repo/workouts'
  import type { WeekNumber } from '../lib/types'
  import DayCard from '../components/DayCard.svelte'

  let { initialWeek = 1 as WeekNumber }: { initialWeek?: WeekNumber } = $props()

  let selectedWeek = $state<WeekNumber>(untrack(() => initialWeek))
  let openDay = $state<number>(0)

  const days = $derived(PROGRAM[selectedWeek])

  function selectWeek(w: WeekNumber) {
    selectedWeek = w
    openDay = 0
  }
  function toggleDay(i: number) {
    openDay = openDay === i ? -1 : i
  }
</script>

<div class="weektabs">
  {#each WEEK_NUMBERS as w (w)}
    {@const pct = weekCompletion(w).pct}
    <button class="wtab" class:active={selectedWeek === w} onclick={() => selectWeek(w)}>
      <span>{weekLabel(w)}</span>
      {#if pct > 0}<span class="wpct">{pct}%</span>{/if}
    </button>
  {/each}
</div>

<div class="days">
  {#each days as day, i (i)}
    <DayCard {day} week={selectedWeek} dayIndex={i} open={openDay === i} onToggle={() => toggleDay(i)} />
  {/each}
</div>

<style>
  .weektabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 4px 0 14px;
    scrollbar-width: none;
  }
  .weektabs::-webkit-scrollbar {
    display: none;
  }
  .wtab {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--border);
    background: var(--bg2);
    color: var(--text2);
    font-size: 13px;
    font-weight: 700;
    padding: 8px 14px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .wtab.active {
    background: color-mix(in srgb, var(--accent) 20%, var(--bg2));
    border-color: var(--accent);
    color: var(--text);
  }
  .wpct {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent2);
  }
  .days {
    display: flex;
    flex-direction: column;
  }
</style>
