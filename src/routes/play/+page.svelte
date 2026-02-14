<!-- src/routes/play/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import WalletConnect from '$lib/components/ui/WalletConnect.svelte';
	import Minting from '$lib/components/ui/Minting.svelte';
	import { economy } from '$lib/game/economy.svelte.ts';
	import { fade } from 'svelte/transition';
	import App from '$lib/components/App.svelte';

	let showMarket = $state(false);

	onMount(() => {
		// Apply game-specific styles strictly on mount
		document.body.style.overflow = 'hidden';
		document.body.style.backgroundColor = 'black';
		document.documentElement.style.overflow = 'hidden'; // Some browsers need this on html too

		return () => {
			// Cleanup strictly on unmount
			document.body.style.overflow = '';
			document.body.style.backgroundColor = '';
			document.documentElement.style.overflow = '';
		};
	});
</script>

<div class="game-viewport">
	<App />
</div>

<style>
	/* Scoped to this component only */
	.game-viewport {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: black;
		z-index: 0;
	}

	.ui-overlay {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 10;
		font-family: 'Inter', sans-serif;
	}

	.ui-overlay > * {
		pointer-events: auto;
	}

	/* Scrollbar Styling */
	::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}
	::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
	}
	::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
