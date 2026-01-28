<!-- src/lib/components/Player/Player.svelte -->
<script lang="ts">
	import { Euler, Vector3 } from 'three';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { RigidBody, CollisionGroups, Collider } from '@threlte/rapier';
	import Controller from './Player Controller/ThirdPersonControls.svelte';
	import Character from './Character.svelte';
	import { useRapier } from '@threlte/rapier';
	import { Ray } from '@dimforge/rapier3d-compat';

	const { movement } = $props();

	const { world } = useRapier();

	// Ground check configuration
	const GROUND_CHECK_DISTANCE = 0.15;
	const RAY_ORIGIN_OFFSET = 0.05;

	let position = $state([0, 1, 0]);
	let radius = 0.3;
	let height = 1.7;
	let speed = 6;

	let capsule: any = $state();
	let capRef: any = $state();

	$effect(() => {
		if (capsule) {
			capRef = capsule;
		}
	});

	let rigidBody: any = $state();

	const { renderer } = useThrelte();
	if (!renderer) throw new Error();

	const temp = new Vector3();

	let grounded = $state(false);
	let wasGrounded = $state(false);

	const onGroundenter = $state(() => {
		// console.log('Player grounded');
	});
	const onGroundexit = $state(() => {
		// console.log('Player airborne');
	});

	$effect(() => {
		if (grounded && !wasGrounded) {
			onGroundenter?.();
		} else if (!grounded && wasGrounded) {
			onGroundexit?.();
		}
		wasGrounded = grounded;
	});

	useTask(() => {
		if (!rigidBody || !capsule) return;

		const pos = rigidBody.translation();
		const capsuleBottom = pos.y - height / 2;
		const rayDir = { x: 0, y: -1, z: 0 };

		// Cast multiple rays in a circle pattern around capsule base
		const checkRadius = radius * 0.6; // Check at 60% of capsule radius
		const rayOffsets = [
			{ x: 0, z: 0 }, // Center
			{ x: checkRadius, z: 0 }, // Forward
			{ x: -checkRadius, z: 0 }, // Back
			{ x: 0, z: checkRadius }, // Right
			{ x: 0, z: -checkRadius } // Left
		];

		grounded = false;

		for (const offset of rayOffsets) {
			// Rotate offset by capsule rotation to align with facing direction
			const rotatedOffset = new Vector3(offset.x, 0, offset.z).applyEuler(capsule.rotation);

			const rayOrigin = {
				x: pos.x + rotatedOffset.x,
				y: capsuleBottom + 0.05,
				z: pos.z + rotatedOffset.z
			};

			const ray = new Ray(rayOrigin, rayDir);
			const hit = world.castRay(
				ray,
				0.2, // slightly longer for edge tolerance
				true,
				undefined,
				undefined,
				undefined,
				rigidBody
			);

			if (hit !== null) {
				grounded = true;
				break; // At least one point is grounded
			}
		}

		// --- Movement (unchanged) ---
		temp.set(0, 0, movement.forward - movement.backward);
		temp.applyEuler(new Euler().copy(capsule.rotation)).multiplyScalar(speed);

		const linVel = rigidBody.linvel();
		temp.y = linVel.y;

		if (movement.up > 0 && grounded) {
			temp.y = 8;
		}

		rigidBody.setLinvel(temp, true);
		position = [pos.x, pos.y, pos.z];
	});
</script>

<T.PerspectiveCamera makeDefault fov={90}>
	<Controller object={capRef} {movement} />
</T.PerspectiveCamera>

<T.Group bind:ref={capsule} {position} rotation.y={Math.PI}>
	<RigidBody bind:rigidBody enabledRotations={[false, false, false]}>
		<CollisionGroups groups={[0]}>
			<Collider shape={'capsule'} args={[height / 2 - radius, radius]} />
		</CollisionGroups>
	</RigidBody>
	<!-- <Character {movement} /> -->
	<Character {movement} character="male" />
	<!-- <Character
		characterUrl="/models/male.glb"
		{movement}
		animationUrls={{
			idle: '/anims/idle.glb',
			run: '/anims/run.glb',
			walk: '/anims/walk.glb'
		}}
	/> -->
</T.Group>
