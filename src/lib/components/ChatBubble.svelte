<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { fade } from 'svelte/transition';
	import type { Group } from 'three';

	let { text, timestamp } = $props();
	let isVisible = $state(false);
	let group = $state<Group>();
	const { camera } = useThrelte();

	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (text && text.trim().length > 0 && timestamp) {
			console.log(`[ChatBubble] New message received: "${text}" at ${timestamp}`);
			isVisible = false; // Briefly hide to trigger re-render if it was already visible
			
			// We use a microtask or a short timeout to toggle it back to true
			// so the #if block actually sees a change.
			setTimeout(() => {
				isVisible = true;
				if (timer) clearTimeout(timer);
				timer = setTimeout(() => {
					console.log(`[ChatBubble] Hiding message: "${text}"`);
					isVisible = false;
				}, 5000);
			}, 50);
		} else {
			isVisible = false;
			if (timer) clearTimeout(timer);
		}
		return () => {
			if (timer) clearTimeout(timer);
		};
	});

	useTask(() => {
		if (group && $camera) {
			group.lookAt($camera.position);
		}
	});
</script>

<T.Group bind:ref={group} position={[0, 2.5, 0]}>
	{#if isVisible}
		<HTML transform>
			<div class="bubble" transition:fade>
				{text}
			</div>
		</HTML>
	{/if}
</T.Group>

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
		position: relative;
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
