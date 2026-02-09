<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import { World } from '@threlte/rapier';
	import Scene from './Scene.svelte';
	import InterfaceUi from './Player/Player Controller/InterfaceUI.svelte';
	import { Vector2, PCFSoftShadowMap } from 'three';
	import { Environment, Sky, Stars } from '@threlte/extras';
	import Sun from './Sun.svelte';

	let movement = $state({
		forward: 0,
		backward: 0,
		left: 0,
		right: 0,
		up: 0,
		rotation: {
			rotateDelta: new Vector2(),
			rotateSpeed: 1.0
		}
	});

	function onKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 's':
				movement.backward = 1;
				break;
			case 'w':
				movement.forward = 1;
				break;
			case 'a':
				movement.left = 1;
				movement.rotation.rotateDelta.x = -2 * movement.rotation.rotateSpeed;

				break;
			case 'd':
				movement.right = 1;
				movement.rotation.rotateDelta.x = 2 * movement.rotation.rotateSpeed;

				break;
			case ' ':
				movement.up = 1;
				break;
			default:
				break;
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		switch (e.key) {
			case 's':
				movement.backward = 0;
				break;
			case 'w':
				movement.forward = 0;
				break;
			case 'a':
				movement.left = 0;
				movement.rotation.rotateDelta.x = 0;

				break;
			case 'd':
				movement.right = 0;
				movement.rotation.rotateDelta.x = 0;

				break;
			case ' ':
				movement.up = 0;
				break;
			default:
				break;
		}
	}

	let isInteracting = $derived(
		Boolean(movement.forward || movement.backward || movement.left || movement.right || movement.up)
	);

	function handleMovementChange(
		direction: 'forward' | 'backward' | 'left' | 'right' | 'up',
		value: number
	) {
		movement[direction] = value;
	}
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} on:keyup={onKeyUp} />

<InterfaceUi {movement} {isInteracting} onMovementChange={handleMovementChange} />

<Canvas shadows={{ type: PCFSoftShadowMap }}>
	<Sky elevation={1} turbidity={10} rayleigh={4} mieCoefficient={0.005} />

	<!-- Lighting only, no background -->
	<!-- <Environment url="/hdr.exr" isBackground={false} /> -->

	<!-- Ghost Buildings Layer -->

	<T.FogExp2 color="#cce0ff" density={1.015} />
	<Stars count={500} radius={80} depth={150} speed={1} />

	<Sun />
	<World>
		<Scene bind:movement />
	</World>
</Canvas>
