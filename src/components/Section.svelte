<script lang="ts">
  import type { Section } from '../lib/types'
  import { sectionMeta } from '../lib/program'
  import ExerciseRow from './ExerciseRow.svelte'

  let { section }: { section: Section } = $props()
  const meta = $derived(sectionMeta(section.type))
</script>

<div class="section">
  <div class="shead">
    <span class="badge" style="color:{meta.accent}; border-color:{meta.accent}">{meta.label}</span>
    <span class="sname">{section.name}</span>
  </div>

  {#if section.type === 'weighin'}
    <div class="weighin">Log today's weight on the Progress tab.</div>
  {:else}
    {#each section.exercises as ex, i (i)}
      <ExerciseRow {ex} />
    {/each}
  {/if}
</div>

<style>
  .section {
    padding: 12px 0;
  }
  .shead {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 2px;
  }
  .badge {
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 3px 7px;
    border: 1px solid;
    border-radius: 5px;
    opacity: 0.9;
  }
  .sname {
    font-size: 13px;
    font-weight: 700;
    color: var(--text2);
  }
  .weighin {
    padding: 10px 0;
    border-top: 1px solid var(--border);
    font-size: 13px;
    color: var(--accent2);
  }
</style>
