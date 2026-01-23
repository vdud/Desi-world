<!-- src/lib/components/Player/Character.svelte -->

<script lang="ts">
	import { GLTF, useGltfAnimations } from '@threlte/extras';
	import { T } from '@threlte/core';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';

	let currentActionKey = 'idle';

	const { gltf, actions } = useGltfAnimations();

	const { movement } = $props();

	$effect(() => {
		$actions[currentActionKey]?.play();
	});

	let rotate = $state(DEG2RAD);

	function transitionTo(nextActionKey: string, duration = 1) {
		const currentAction = $actions[currentActionKey];
		const nextAction = $actions[nextActionKey];
		if (!nextAction || currentAction === nextAction) return;
		// Function inspired by: https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_blending.html
		nextAction.enabled = true;
		if (currentAction) {
			currentAction.crossFadeTo(nextAction, duration, true);
		}
		// Not sure why I need this but the source code does not
		nextAction.play();
		currentActionKey = nextActionKey;
	}

	function backwardTransitionIn() {
		rotate = 180 * DEG2RAD;
		transitionTo('walk', 0.3);
	}
	function backwardTransitionOut() {
		rotate = 0 * DEG2RAD;
		transitionTo('idle', 0.3);
	}

	let prevForward: any, prevBackward: any;

	$effect(() => {
		if (prevForward !== movement.forward) {
			movement.forward === 0 ? transitionTo('idle', 0.3) : transitionTo('run', 0.3);
			prevForward = movement.forward;
		}
	});

	$effect(() => {
		if (prevBackward !== movement.backward) {
			movement.backward === 1 ? backwardTransitionIn() : backwardTransitionOut();
			prevBackward = movement.backward;
		}
	});

	const modal = 'https://threejs.org/examples/models/gltf/Xbot.glb';
</script>

<T.Mesh receiveShadow castShadow>
	<GLTF
		castShadow
		receiveShadow
		url={modal}
		position={[0, -0.86, 0]}
		rotation.y={rotate}
		bind:gltf={$gltf}
	/>
</T.Mesh>
