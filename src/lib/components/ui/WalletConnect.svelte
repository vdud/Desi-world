<script lang="ts">
	import { web3 } from '$lib/web3/web3.svelte';

	let { class: className = '' } = $props();
</script>

{#if web3.isConnected}
	<button class="wallet-btn connected {className}" onclick={() => web3.open()}>
		<span class="status-indicator"></span>
		<span class="address-text">
			{web3.address?.slice(0, 4)}...{web3.address?.slice(-4)}
		</span>
	</button>
{:else}
	<button class="wallet-btn disconnected {className}" onclick={() => web3.open()}> Connect </button>
{/if}

<style>
	.wallet-btn {
		display: flex;
		align-items: center;
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border: 1px solid;
		transition: all 300ms var(--ease-out-expo);
		font-family: var(--font-mono);
		border-radius: 4px;
		cursor: pointer;
	}

	.disconnected {
		background: transparent;
		border-color: var(--border-color);
		color: var(--text-primary);
	}

	.disconnected:hover {
		border-color: var(--terminal-accent);
		color: var(--terminal-accent);
		box-shadow: 0 0 10px rgba(74, 246, 38, 0.2);
	}

	.connected {
		background: rgba(74, 246, 38, 0.1);
		border-color: rgba(74, 246, 38, 0.3);
		color: var(--terminal-accent);
	}

	.status-indicator {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		background: var(--terminal-accent);
		margin-right: 0.5rem;
		box-shadow: 0 0 8px var(--terminal-accent);
		animation: pulse 2s infinite;
	}

	.address-text {
		letter-spacing: 0;
		text-transform: none;
	}

	@keyframes pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}
</style>
