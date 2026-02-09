<script lang="ts">
	import { T } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let { text } = $props();
	let visible = $state(true);

	onMount(() => {
		const timer = setTimeout(() => {
			visible = false;
		}, 5000);
		return () => clearTimeout(timer);
	});
</script>

{#if visible}
	<T.Group position={[0, 2.5, 0]}>
		<HTML transform>
			<div class="bubble" transition:fade>
				{text}
			</div>
		</HTML>
	</T.Group>
{/if}

<style>
	.bubble {
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px 12px;
		border-radius: 12px;
		font-family: 'Inter', sans-serif;
		font-size: 14px;
		white-space: nowrap;
		pointer-events: none;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
	/* Little arrow */
	.bubble::after {
		content: '';
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		border-width: 6px 6px 0;
		border-style: solid;
		border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
	}
</style>
