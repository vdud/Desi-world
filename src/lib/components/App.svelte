<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { World } from '@threlte/rapier';
	import Scene from './Scene.svelte';
	import InterfaceUi from './Player/Player Controller/Interface/InterfaceUI.svelte';
	import {
		Camera,
		Vector2,
		Vector3,
		Quaternion,
		PCFSoftShadowMap,
		ACESFilmicToneMapping
	} from 'three';
	import PlaneAnother from './models/Ground.svelte';
	import { ContactShadows, SoftShadows } from '@threlte/extras';

	const movement = $state({
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

<Canvas>
	<World>
		<Scene {movement} />
	</World>
</Canvas>
