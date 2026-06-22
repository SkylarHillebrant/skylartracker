<script lang="ts">
  import { weightsWithDeltas, deleteWeight } from '../lib/repo/weights'

  const rows = $derived(weightsWithDeltas())

  function fmtDate(d: string): string {
    const [y, m, day] = d.split('-')
    return `${m}/${day}/${y.slice(2)}`
  }
</script>

{#if rows.length === 0}
  <p class="empty">No weigh-ins yet. Log one above to start tracking.</p>
{:else}
  <div class="table">
    {#each rows as r (r.id)}
      <div class="trow">
        <span class="date">{fmtDate(r.entryDate)}</span>
        <span class="wt">{r.weight}</span>
        <span class="delta" class:down={r.delta != null && r.delta < 0} class:up={r.delta != null && r.delta > 0}>
          {#if r.delta == null}—{:else}{r.delta > 0 ? '+' : ''}{r.delta}{/if}
        </span>
        <span class="note">{r.note}</span>
        <button class="del" onclick={() => deleteWeight(r.id)} aria-label="Delete entry">×</button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .empty {
    color: var(--text3);
    font-size: 14px;
    text-align: center;
    padding: 16px 0;
  }
  .table {
    display: flex;
    flex-direction: column;
  }
  .trow {
    display: grid;
    grid-template-columns: 56px 48px 48px 1fr 28px;
    align-items: center;
    gap: 8px;
    padding: 11px 0;
    border-top: 1px solid var(--border);
  }
  .date {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text2);
  }
  .wt {
    font-family: var(--font-mono);
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
  .delta {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text3);
  }
  .delta.down {
    color: var(--green);
  }
  .delta.up {
    color: var(--red);
  }
  .note {
    font-size: 12px;
    color: var(--text3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .del {
    border: 0;
    background: transparent;
    color: var(--text3);
    font-size: 20px;
    line-height: 1;
  }
  .del:active {
    color: var(--red);
  }
</style>
