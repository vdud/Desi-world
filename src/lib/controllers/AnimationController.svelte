<!-- lib/controllers/AnimationController.svelte -->
<script lang="ts">
	import { useGltfAnimations } from '@threlte/extras';
	import { controllerState, isGrounded } from './ControllerState';
	import type { ControllerState } from './ControllerState'; // <-- IMPORT TYPE
	import { ControllerConfig } from './ControllerConfig';
	import { onMount } from 'svelte';

	const { gltf, actions } = useGltfAnimations();

	const stateToClip: Record<ControllerState, string | null> = {
		idle: 'idle',
		walking: 'walk',
		running: 'run',
		airborne: 'jump',
		locked: null
	};

	let currentAction: string | null = 'idle';

	$: {
		const nextAction = stateToClip[$controllerState];

		if (nextAction !== currentAction) {
			const from = currentAction ? $actions[currentAction] : null;
			const to = nextAction ? $actions[nextAction] : null;

			if (to) {
				to.reset().fadeIn(ControllerConfig.stateTransitionDelay);
				if (from) {
					from.crossFadeTo(to, ControllerConfig.stateTransitionDelay, true);
				}
				currentAction = nextAction;
			} else if (from) {
				from.fadeOut(ControllerConfig.stateTransitionDelay);
				currentAction = null;
			}
		}
	}

	onMount(() => {
		if ($actions.idle) {
			$actions.idle.play();
			currentAction = 'idle';
		}
	});
</script>

<slot />
