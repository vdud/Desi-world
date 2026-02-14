<script lang="ts">
	import ConnectWallet from '$lib/components/ui/ConnectWallet.svelte';
	import UserProfileModal from '$lib/components/ui/UserProfileModal.svelte';
	import { playerName } from '$lib/stores/commonStores';
	import { web3 } from '$lib/web3/web3.svelte';

	interface Props {
		showMarket: boolean;
		isMenuOpen: boolean;
	}

	let { showMarket = $bindable(), isMenuOpen = $bindable() }: Props = $props();

	let showProfile = $state(false);
</script>

<!-- Top Right Action Bar (Fixed Position) -->
<div class="top-action-bar">
	<button
		class="action-btn"
		onclick={() => (showMarket = !showMarket)}
		onpointerdown={(e) => e.stopPropagation()}
	>
		{showMarket ? 'Close' : 'Marketplace'}
	</button>

	<!-- Profile / Wallet Trigger -->
	<button
		class="profile-btn {web3.isConnected ? 'connected' : ''}"
		onclick={() => (showProfile = true)}
		onpointerdown={(e) => e.stopPropagation()}
	>
		<div class="indicator"></div>
		<span class="name-text">
			{$playerName}
		</span>
	</button>

	<button
		class="icon-btn"
		onclick={() => (isMenuOpen = !isMenuOpen)}
		onpointerdown={(e) => e.stopPropagation()}
		aria-label="Toggle Menu"
	>
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M3 12h18M3 6h18M3 18h18" />
		</svg>
	</button>
</div>

<UserProfileModal isOpen={showProfile} onClose={() => (showProfile = false)} />

<style>
	/* --- Top Action Bar (Buttons) --- */
	.top-action-bar {
		position: fixed;
		top: max(env(safe-area-inset-top), 20px);
		right: max(env(safe-area-inset-right), 20px);
		display: flex;
		align-items: center;
		gap: 12px;
		z-index: 105;
		pointer-events: auto; /* Ensure clicks register */
	}

	.action-btn {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--border-color);
		padding: 8px 16px;
		border-radius: 999px; /* Pill shape */
		color: var(--text-primary);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.action-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--terminal-accent);
		box-shadow: 0 0 10px rgba(74, 246, 38, 0.2);
	}

	.profile-btn {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(12px);
		border: 1px solid var(--border-color);
		padding: 6px 16px;
		height: 44px; /* Match icon-btn height */
		border-radius: 999px;
		color: var(--text-primary);
		font-size: 0.85rem;
		font-family: var(--font-mono);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		transition: all 0.2s ease;
	}

	.profile-btn:hover {
		border-color: var(--text-primary);
		background: rgba(255, 255, 255, 0.1);
	}

	.profile-btn.connected {
		border-color: rgba(39, 201, 63, 0.5);
		background: rgba(39, 201, 63, 0.1);
	}

	.indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ff5f56;
		box-shadow: 0 0 5px rgba(255, 95, 86, 0.5);
	}

	.profile-btn.connected .indicator {
		background: #27c93f;
		box-shadow: 0 0 5px rgba(39, 201, 63, 0.5);
	}

	.name-text {
		max-width: 150px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.icon-btn {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(12px);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.icon-btn:active {
		transform: scale(0.95);
		border-color: var(--terminal-accent);
	}
</style>
