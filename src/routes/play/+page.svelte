<script lang="ts">
	import App from '$lib/components/App.svelte';
	import { onMount } from 'svelte';

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
</style>
