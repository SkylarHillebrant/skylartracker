<script lang="ts">
  import { addWeight } from '../lib/repo/weights'

  function todayStr(): string {
    const d = new Date()
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 10)
  }

  let weight = $state('')
  let date = $state(todayStr())
  let note = $state('')

  function submit(e: Event) {
    e.preventDefault()
    const w = parseFloat(weight)
    if (Number.isNaN(w) || !date) return
    addWeight(w, date, note.trim())
    weight = ''
    note = ''
    date = todayStr()
  }
</script>

<form class="form" onsubmit={submit}>
  <div class="grid">
    <label>
      <span>Weight (lb)</span>
      <input type="number" inputmode="decimal" step="0.1" placeholder="—" bind:value={weight} required />
    </label>
    <label>
      <span>Date</span>
      <input type="date" bind:value={date} required />
    </label>
  </div>
  <label>
    <span>Note (optional)</span>
    <input type="text" placeholder="fasted, morning…" bind:value={note} />
  </label>
  <button type="submit" class="add">Log weight</button>
</form>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  label span {
    font-size: 12px;
    color: var(--text3);
  }
  input {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    padding: 11px 12px;
  }
  input:focus {
    outline: none;
    border-color: var(--accent);
  }
  .add {
    margin-top: 2px;
    border: 0;
    border-radius: 10px;
    background: var(--accent);
    color: #06122a;
    font-weight: 800;
    font-size: 15px;
    padding: 12px;
  }
  .add:active {
    opacity: 0.85;
  }
</style>
