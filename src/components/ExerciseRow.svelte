<script lang="ts">
  import type { Exercise } from '../lib/types'
  let { ex }: { ex: Exercise } = $props()
</script>

{#if ex.n === ''}
  <!-- legacy placeholder/note line (empty name) -->
  <div class="noteline">{ex.note}</div>
{:else}
  <div class="row">
    <div class="left">
      <span class="name">{ex.n}</span>
      {#if ex.note}<span class="note">{ex.note}</span>{/if}
    </div>
    {#if ex.r}<span class="reps">{ex.r}</span>{/if}
  </div>
{/if}

<style>
  .row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-top: 1px solid var(--border);
  }
  .left {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
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
  .reps {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    color: var(--accent2);
    white-space: nowrap;
    padding-top: 1px;
  }
  .noteline {
    padding: 8px 0;
    border-top: 1px solid var(--border);
    font-size: 12px;
    font-style: italic;
    color: var(--text3);
  }
</style>
