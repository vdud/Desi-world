<!-- src/lib/components/Player/Player.svelte -->
<script lang="ts">
	import { Euler, Vector3 } from 'three';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { RigidBody, CollisionGroups, Collider } from '@threlte/rapier';
	import Controller from './Player Controller/ThirdPersonControls.svelte';
	import Character from './Character.svelte';
	import { useRapier } from '@threlte/rapier';
	import { Ray } from '@dimforge/rapier3d-compat';
	import { playerPosition } from '$lib/stores/commonStores';

	const { movement } = $props();

	const { world } = useRapier();
	const { renderer } = useThrelte();
	if (!renderer) throw new Error();

	// Spawn & Respawn configuration
	const SPAWN_POS = { x: 0, y: 2, z: 0 };
	const FALL_THRESHOLD = -15;
	const GROUND_CHECK_DISTANCE = 0.15;

	let position = $state([0, 2, 0]);
	let radius = 0.3;
	let height = 1.7;
	let speed = 6;

	let capsule: any = $state();
	let capRef: any = $state();
	let rigidBody: any = $state();

	let grounded = $state(false);
	let wasGrounded = $state(false);

	// Respawn function
	function respawn() {
		if (!rigidBody) return;

		// Reset position
		rigidBody.setTranslation(SPAWN_POS, true);
		// Reset velocity (stop falling momentum)
		rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
		rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);

		position = [SPAWN_POS.x, SPAWN_POS.y, SPAWN_POS.z];
	}

	const temp = new Vector3();

	useTask(() => {
		if (!rigidBody || !capsule) return;

		const pos = rigidBody.translation();

		// Report position for proximity loading
		playerPosition.set(new Vector3(pos.x, pos.y, pos.z));

		// Fall detection - respawn if below threshold
		if (pos.y < FALL_THRESHOLD) {
			respawn();
			return;
		}

		// Multi-ray ground check for better edge detection
		const capsuleBottom = pos.y - height / 2;
		const rayDir = { x: 0, y: -1, z: 0 };
		const checkRadius = radius * 0.6;

		const rayOffsets = [
			{ x: 0, z: 0 },
			{ x: checkRadius, z: 0 },
			{ x: -checkRadius, z: 0 },
			{ x: 0, z: checkRadius },
			{ x: 0, z: -checkRadius }
		];

		grounded = false;
		for (const offset of rayOffsets) {
			const rotatedOffset = new Vector3(offset.x, 0, offset.z).applyEuler(capsule.rotation);
			const rayOrigin = {
				x: pos.x + rotatedOffset.x,
				y: capsuleBottom + 0.05,
				z: pos.z + rotatedOffset.z
			};

			const ray = new Ray(rayOrigin, rayDir);
			const hit = world.castRay(ray, 0.2, true, undefined, undefined, undefined, rigidBody);

			if (hit !== null) {
				grounded = true;
				break;
			}
		}

		// Movement logic
		temp.set(0, 0, movement.forward - movement.backward);
		temp.applyEuler(new Euler().copy(capsule.rotation)).multiplyScalar(speed);

		const linVel = rigidBody.linvel();
		temp.y = linVel.y;

		if (movement.up > 0 && grounded) {
			temp.y = 8;
		}

		rigidBody.setLinvel(temp, true);
		position = [pos.x, pos.y, pos.z];

		// Track grounded state changes
		if (grounded && !wasGrounded) {
			// Just landed - could trigger landing effects here
		}
		wasGrounded = grounded;
	});
</script>

<T.PerspectiveCamera makeDefault fov={75} near={0.1} far={1000}>
	<Controller object={capsule} {movement} />
</T.PerspectiveCamera>

<!-- Player capsule - this ref is passed to controller -->
<T.Group bind:ref={capsule} position={[position[0], position[1], position[2]]} rotation.y={Math.PI}>
	<RigidBody
		bind:rigidBody
		enabledRotations={[false, false, false]}
		position={[position[0], position[1], position[2]]}
	>
		<CollisionGroups groups={[0]}>
			<Collider shape={'capsule'} args={[0.55, 0.3]} />
		</CollisionGroups>
	</RigidBody>
	<Character {movement} {grounded} character="female" />
</T.Group>
