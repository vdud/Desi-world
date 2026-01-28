<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { useDraco, useGltf } from '@threlte/extras';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { AnimationMixer, LoopRepeat } from 'three';

	interface Props {
		movement: {
			forward: number;
			backward: number;
		};
		character?: 'female' | 'male';
	}

	let { movement, character = 'female' }: Props = $props();

	let mixer = $state<AnimationMixer>();
	let currentActionKey = $state<'idle' | 'run'>('idle');
	let targetRotation = $state(0);
	let actions = $state<{ idle?: any; run?: any }>({});

	const dracoLoader = useDraco();

	// Load character model
	const charPath =
		character === 'female' ? '/models/female-transformed.glb' : '/models/male-transformed.glb';
	const charGltf = useGltf(charPath, { dracoLoader });

	// Load animation files
	const idleGltf = useGltf('/models/Animations/idle-transformed.glb', { dracoLoader });
	const runGltf = useGltf('/models/Animations/run-transformed.glb', { dracoLoader });
	// Initialize once when all loaded - use untrack to prevent loops

	function initMixer(scene: any) {
		if (mixer) {
			mixer.stopAllAction();
		}

		const newMixer = new AnimationMixer(scene);

		// Wait for animations to load
		Promise.all([$idleGltf, $runGltf]).then(([idle, run]) => {
			if (!idle?.animations?.[0] || !run?.animations?.[0]) {
				console.error('Missing animations:', { idle, run });
				return;
			}

			// Create actions properly
			const idleAction = newMixer.clipAction(idle.animations[0]);
			idleAction.setLoop(LoopRepeat, Infinity);
			idleAction.clampWhenFinished = false;

			const runAction = newMixer.clipAction(run.animations[0]);
			runAction.setLoop(LoopRepeat, Infinity);
			runAction.clampWhenFinished = false;

			actions = {
				idle: idleAction,
				run: runAction
			};

			// Start idle immediately
			idleAction.play();
			currentActionKey = 'idle';
			mixer = newMixer;
		});
	}

	function switchTo(nextKey: 'idle' | 'run') {
		if (!mixer || !actions.idle || !actions.run) return;
		if (currentActionKey === nextKey) return;

		const current = actions[currentActionKey];
		const next = actions[nextKey];

		// Reset next action to start from beginning
		next.reset();
		next.setEffectiveWeight(1);
		next.setEffectiveTimeScale(1);
		next.enabled = true;

		if (current) {
			// Smooth crossfade
			current.crossFadeTo(next, 0.3, true);
		}

		next.play();
		currentActionKey = nextKey;
	}

	// Update loop
	useTask((delta) => {
		mixer?.update(delta);
	});

	// Movement logic
	let wasMoving = $state(false);

	$effect(() => {
		if (!mixer) return;

		const isMoving = movement.forward > 0 || movement.backward === 1;

		// Rotation
		targetRotation = movement.backward === 1 ? 180 * DEG2RAD : 0;

		// Only switch on state change
		if (isMoving !== wasMoving) {
			wasMoving = isMoving;
			switchTo(isMoving ? 'run' : 'idle');
		}
	});
</script>

{#if $charGltf}
	<T
		is={$charGltf.scene}
		position={[0, -0.86, 0]}
		rotation.y={targetRotation}
		castShadow
		receiveShadow
		oncreate={(ref) => {
			initMixer(ref);
			return () => {
				mixer?.stopAllAction();
			};
		}}
	/>
{/if}
