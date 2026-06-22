<script lang="ts">
  import type { Day, WeekNumber } from '../lib/types'
  import { tagColor } from '../lib/program'
  import { dayCompletion } from '../lib/repo/workouts'
  import Section from './Section.svelte'

  let {
    day,
    week,
    dayIndex,
    open = false,
    onToggle,
  }: {
    day: Day
    week: WeekNumber
    dayIndex: number
    open?: boolean
    onToggle?: () => void
  } = $props()

  const color = $derived(tagColor(day.tag))
  const comp = $derived(dayCompletion(week, dayIndex, day))
</script>

<div class="card" class:open>
  <button class="header" onclick={() => onToggle?.()}>
    <div class="titles">
      <div class="row1">
        <span class="title">{day.title}</span>
        <span class="tag" style="background:{color.bg}; color:{color.fg}">{day.tag}</span>
      </div>
      <span class="subtitle">{day.subtitle}</span>
    </div>
    <div class="meta">
      {#if comp.done > 0}
        <span class="pct" class:full={comp.pct === 100}>{comp.pct}%</span>
      {/if}
      <div class="ring" style="--p:{comp.pct}">
        <span>{comp.done}/{comp.total}</span>
      </div>
      <span class="chev" class:rot={open}>›</span>
    </div>
  </button>

  {#if open}
    <div class="body">
      {#each day.sections as section, si (si)}
        <Section {section} {week} {dayIndex} sectionIndex={si} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 12px;
  }
  .card.open {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
  }
  .header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border: 0;
    background: transparent;
    text-align: left;
  }
  .titles {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .row1 {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .title {
    font-size: 15px;
    font-weight: 800;
    color: var(--text);
  }
  .tag {
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 3px 7px;
    border-radius: 4px;
  }
  .subtitle {
    font-size: 12px;
    color: var(--text3);
    line-height: 1.3;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .pct {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent2);
  }
  .pct.full {
    color: var(--green);
  }
  .ring {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text2);
    background: var(--bg3);
    border-radius: 999px;
    padding: 3px 8px;
    white-space: nowrap;
  }
  .chev {
    font-size: 20px;
    color: var(--text3);
    transition: transform 0.2s;
    transform: rotate(90deg);
  }
  .chev.rot {
    transform: rotate(-90deg);
    color: var(--accent2);
  }
  .body {
    padding: 4px 16px 14px;
  }
</style>
