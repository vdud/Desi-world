<script lang="ts">
	import { Euler, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { RigidBody, CollisionGroups, Collider } from '@threlte/rapier';
	import { createEventDispatcher } from 'svelte';
	import Controller from './ThirdPersonControls.svelte';
	import Character2 from './Character2.svelte';

	import { GLTF, useGltfAnimations } from '@threlte/extras';
	import { backward, forward, left, right, up } from '$lib/stores/characterControlMovement';

	const { gltf, actions } = useGltfAnimations();

	export let position = [0, 1, 0];
	export let radius = 0.3;
	export let height = 1.7;
	export let speed = 6;

	let capsule;
	let capRef;
	$: if (capsule) {
		capRef = capsule;
	}
	let rigidBody;

	const { renderer } = useThrelte();
	if (!renderer) throw new Error();

	const temp = new Vector3();
	const dispatch = createEventDispatcher();

	let grounded = false;
	$: grounded ? dispatch('groundenter') : dispatch('groundexit');

	useTask((delta) => {
		if (!rigidBody || !capsule) return;

		// movement direction
		temp.set(0, 0, $forward - $backward);

		// rotate by capsule orientation and apply speed
		temp.applyEuler(new Euler().copy(capsule.rotation)).multiplyScalar(speed);

		// preserve falling velocity
		const linVel = rigidBody.linvel();
		temp.y = linVel.y;

		// jump impulse
		temp.y += $up;

		// apply velocity
		rigidBody.setLinvel(temp, true);

		// sync camera / state position
		const pos = rigidBody.translation();
		position = [pos.x, pos.y, pos.z];
	});

	function onKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 's':
				$backward = 1;
				break;
			case 'w':
				$forward = 1;
				break;
			case 'a':
				$left = 1;
				break;
			case 'd':
				$right = 1;
				break;
			case ' ':
				$up = 1;
				break;
			default:
				break;
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		switch (e.key) {
			case 's':
				$backward = 0;
				break;
			case 'w':
				$forward = 0;
				break;
			case 'a':
				$left = 0;
				break;
			case 'd':
				$right = 0;
				break;
			case ' ':
				$up = 0;
				break;
			default:
				break;
		}
	}
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} on:keyup={onKeyUp} />

<T.PerspectiveCamera makeDefault fov={90}>
	<Controller bind:object={capRef} />
</T.PerspectiveCamera>

<T.Group bind:ref={capsule} {position} rotation.y={Math.PI}>
	<RigidBody bind:rigidBody enabledRotations={[false, false, false]}>
		<CollisionGroups groups={[0]}>
			<Collider shape={'capsule'} args={[height / 2 - radius, radius]} />
			<!-- <T.Mesh geometry={new BoxGeometry(0.3, 1.8 - 0.3 * 2)}>
					<T.MeshBasicMaterial color={'red'} />
				</T.Mesh> -->
		</CollisionGroups>
	</RigidBody>

	<Character2 />
</T.Group>
