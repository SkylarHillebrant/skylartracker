<script lang="ts">
  import { signInWithEmail } from '../lib/stores/session.svelte'

  let email = $state('')
  let status = $state<'idle' | 'sending' | 'sent' | 'error'>('idle')
  let msg = $state('')

  async function submit(e: Event) {
    e.preventDefault()
    if (!email.trim()) return
    status = 'sending'
    const { error } = await signInWithEmail(email.trim())
    if (error) {
      status = 'error'
      msg = error
    } else {
      status = 'sent'
    }
  }
</script>

{#if status === 'sent'}
  <p class="ok">📧 Check your email — tap the sign-in link to back up &amp; sync this device.</p>
{:else}
  <form class="form" onsubmit={submit}>
    <input type="email" placeholder="you@email.com" bind:value={email} required autocomplete="email" />
    <button type="submit" disabled={status === 'sending'}>
      {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
    </button>
    {#if status === 'error'}<p class="err">{msg}</p>{/if}
  </form>
{/if}

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
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
  button {
    border: 0;
    border-radius: 10px;
    background: var(--accent);
    color: #06122a;
    font-weight: 800;
    padding: 12px;
  }
  button:disabled {
    opacity: 0.6;
  }
  .ok {
    color: var(--accent2);
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }
  .err {
    color: var(--red);
    font-size: 13px;
    margin: 0;
  }
</style>
