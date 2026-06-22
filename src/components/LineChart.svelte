<script lang="ts">
  // Dependency-free inline-SVG line/area chart. Responsive via viewBox.
  let {
    points,
    goal = null,
    height = 170,
    stroke = 'var(--accent2)',
    showArea = true,
  }: {
    points: { x: number; y: number; label?: string }[]
    goal?: number | null
    height?: number
    stroke?: string
    showArea?: boolean
  } = $props()

  const W = 320
  const PAD = 22

  const view = $derived.by(() => {
    if (points.length === 0) return null
    const H = height
    const ys = points.map((p) => p.y)
    const xs = points.map((p) => p.x)
    let minY = Math.min(...ys, goal ?? Infinity)
    let maxY = Math.max(...ys, goal ?? -Infinity)
    if (!isFinite(minY) || !isFinite(maxY)) return null
    if (minY === maxY) {
      minY -= 1
      maxY += 1
    }
    const padY = (maxY - minY) * 0.12
    minY -= padY
    maxY += padY
    const minX = Math.min(...xs)
    const spanX = Math.max(...xs) - minX || 1
    const sx = (x: number) => PAD + ((x - minX) / spanX) * (W - 2 * PAD)
    const sy = (y: number) => PAD + (1 - (y - minY) / (maxY - minY)) * (H - 2 * PAD)
    const pts = points.map((p) => ({ X: sx(p.x), Y: sy(p.y) }))
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.X.toFixed(1)} ${p.Y.toFixed(1)}`).join(' ')
    const baseY = (H - PAD).toFixed(1)
    const area = `${line} L ${pts[pts.length - 1].X.toFixed(1)} ${baseY} L ${pts[0].X.toFixed(1)} ${baseY} Z`
    return {
      H,
      line,
      area,
      last: pts[pts.length - 1],
      goalY: goal != null ? sy(goal) : null,
      minY: Math.round(minY),
      maxY: Math.round(maxY),
    }
  })
</script>

{#if !view}
  <div class="empty" style="height:{height}px">Not enough data yet.</div>
{:else}
  <svg viewBox="0 0 {W} {view.H}" preserveAspectRatio="none" class="chart" style="height:{height}px">
    {#if view.goalY != null}
      <line x1={PAD} x2={W - PAD} y1={view.goalY} y2={view.goalY} class="goal" />
    {/if}
    {#if showArea}
      <path d={view.area} class="area" />
    {/if}
    <path d={view.line} fill="none" stroke={stroke} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
    <circle cx={view.last.X} cy={view.last.Y} r="3.5" fill={stroke} />
  </svg>
  <div class="yaxis">
    <span>{view.maxY}</span>
    <span>{view.minY}</span>
  </div>
{/if}

<style>
  .chart {
    width: 100%;
    display: block;
    overflow: visible;
  }
  .area {
    fill: color-mix(in srgb, var(--accent) 16%, transparent);
    stroke: none;
  }
  .goal {
    stroke: var(--green);
    stroke-width: 1;
    stroke-dasharray: 4 4;
    opacity: 0.7;
  }
  .yaxis {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text3);
    margin-top: 2px;
  }
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text3);
    font-size: 13px;
    border: 1px dashed var(--border);
    border-radius: 12px;
  }
</style>
