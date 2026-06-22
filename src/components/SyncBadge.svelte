<script lang="ts">
  import { session } from '../lib/stores/session.svelte'
  import { sync } from '../lib/offline/sync'

  const badge = $derived.by(() => {
    if (!session.configured) return { t: 'Local', cls: 'muted' }
    if (!session.userId) return { t: 'Not backed up', cls: 'warn' }
    if (sync.syncing) return { t: 'Syncing…', cls: 'muted' }
    if (!sync.online) return { t: sync.pending > 0 ? `Offline · ${sync.pending}` : 'Offline', cls: 'warn' }
    if (sync.pending > 0) return { t: `${sync.pending} queued`, cls: 'warn' }
    return { t: 'Synced', cls: 'ok' }
  })
</script>

<span class="badge {badge.cls}">{badge.t}</span>

<style>
  .badge {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    white-space: nowrap;
  }
  .muted {
    color: var(--text3);
  }
  .ok {
    color: var(--green);
    border-color: color-mix(in srgb, var(--green) 40%, var(--border));
  }
  .warn {
    color: var(--accent2);
    border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
  }
</style>
