<!-- src/lib/components/ui/Minting.svelte -->
<script lang="ts">
	import { economy } from '$lib/game/economy.svelte.ts';
	import { web3 } from '$lib/web3/web3.svelte';
</script>

<div class="terminal-box">
	<div class="terminal-header">
		<div class="terminal-dot green"></div>
		<span class="terminal-title">resource_module.sys</span>
	</div>

	{#if !web3.isConnected}
		<div class="terminal-body">
			<p style="color: var(--text-inverted);">// AWAITING CONNECTION</p>
		</div>
	{:else}
		<div class="terminal-body">
			<p class="text-xs mb-2" style="color: var(--text-inverted);">CURRENT BALANCE:</p>
			<div class="flex items-baseline gap-2 mb-4">
				<span
					class="text-2xl font-bold"
					style="font-family: var(--font-mono); color: var(--terminal-accent);"
				>
					{economy.balance}
				</span>
				<span style="color: var(--terminal-accent);">ROOT</span>
			</div>

			<div class="action-grid">
				<button class="mint-btn" disabled={economy.isLoading} onclick={() => economy.mintToken()}>
					{#if economy.isLoading}
						Running...
					{:else}
						Mint +100 $ROOT
					{/if}
				</button>

				<button
					class="mint-btn item"
					disabled={economy.isLoading}
					onclick={() => economy.mintItem()}
				>
					{#if economy.isLoading}
						Running...
					{:else}
						Mint Random Item
					{/if}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.action-grid {
		display: grid;
		gap: 8px;
	}

	.mint-btn {
		width: 100%;
		padding: 0.75rem;
		font-size: 0.8rem;
		font-family: var(--font-mono);
		background: transparent;
		color: var(--terminal-accent);
		border: 1px solid var(--terminal-accent);
		transition: all 0.3s var(--ease-out-expo);
		cursor: pointer;
		text-align: left;
	}

	.mint-btn:hover:not(:disabled) {
		background: rgba(74, 246, 38, 0.1);
		border-color: var(--terminal-accent);
	}

	.mint-btn.item {
		color: #3498db;
		border-color: #3498db;
	}

	.mint-btn.item:hover:not(:disabled) {
		background: rgba(52, 152, 219, 0.1);
	}

	.mint-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
