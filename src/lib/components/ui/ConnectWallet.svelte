<script lang="ts">
	import { web3 } from '$lib/web3/web3.svelte';
</script>

{#if web3.isConnected}
	<div class="connected-pill">
		<span class="indicator"></span>
		{web3.address?.slice(0, 6)}...{web3.address?.slice(-4)}
	</div>
{:else}
	<button class="connect-btn" onclick={() => web3.open()}> Connect Wallet </button>
{/if}

<style>
	.connect-btn {
		background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 50px;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
	}

	.connect-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(168, 85, 247, 0.6);
	}

	.connected-pill {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.5rem 1rem;
		border-radius: 50px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 10px #22c55e;
	}
</style>
