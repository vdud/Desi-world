<!-- src/lib/components/Player/Player.svelte -->
<script lang="ts">
	import * as THREE from 'three';
	import { Euler, Vector3 } from 'three';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { RigidBody, CollisionGroups, Collider } from '@threlte/rapier';
	import Controller from './Player Controller/ThirdPersonControls.svelte';
	import AgentController from './Player Controller/AgentController.svelte';
	import Character from './Character.svelte';
	import { useRapier } from '@threlte/rapier';
	import { Ray } from '@dimforge/rapier3d-compat';
	import { playerPosition, audioListener } from '$lib/stores/commonStores';
	import { network } from '$lib/network/network.svelte';

	let { movement = $bindable() } = $props();

	const { world } = useRapier();
	const { renderer } = useThrelte();
	if (!renderer) throw new Error();

	// Spawn & Respawn configuration
	const SPAWN_POS = { x: 0, y: 2, z: 0 };
	const FALL_THRESHOLD = -15;
	const GROUND_CHECK_DISTANCE = 0.15;

	// Randomize spawn slightly to avoid stacking
	const randomOffset = (Math.random() - 0.5) * 4; // +/- 2 meters
	let position = $state([randomOffset, 2, randomOffset]);
	let radius = 0.3;
	let height = 1.7;
	let speed = 6;

	let capsule: any = $state();
	let capRef: any = $state();
	let rigidBody: any = $state();

	let grounded = $state(false);
	let wasGrounded = $state(false);
	let lastSendTime = 0;
	let audioContextSuspended = $state(false);

	// Random Visuals
	const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
	const randomMetalness = Math.random();
	const randomRoughness = Math.random();

	// Respawn function
	function respawn() {
		if (!rigidBody) return;

		const respawnOffset = (Math.random() - 0.5) * 4;
		// Reset position
		const newX = SPAWN_POS.x + respawnOffset;
		const newZ = SPAWN_POS.z + respawnOffset;

		rigidBody.setTranslation({ x: newX, y: SPAWN_POS.y, z: newZ }, true);
		// Reset velocity (stop falling momentum)
		rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
		rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);

		position = [newX, SPAWN_POS.y, newZ];
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

		// Movement logic - Inverted X axis to account for 180-degree capsule rotation
		temp.set(movement.left - movement.right, 0, movement.forward - movement.backward);
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

		// Network Broadcast (Throttled)
		const now = performance.now();
		if (now - lastSendTime > 50) {
			network.sendUpdate({
				x: position[0], // Use the synced state position
				y: position[1],
				z: position[2],
				rotation: capsule.rotation.y, // Assuming Y rotation on capsule
				movement,
				grounded,
				character: 'anon',
				color: randomColor,
				metalness: randomMetalness,
				roughness: randomRoughness,
				isAgent: network.isAgent
			});
			lastSendTime = now;
		}
	});

	// Initialize Voice (requests mic)
	$effect(() => {
		network.setupVoice();

		const resumeAudio = () => {
			audioListener.update((listener) => {
				if (listener) {
					if (listener.context.state === 'suspended') {
						audioContextSuspended = true;
						listener.context.resume().then(() => {
							audioContextSuspended = false;
						});
					} else {
						audioContextSuspended = false;
					}
				}
				return listener;
			});
			// Keep listener active in case it suspends again or wasn't ready
		};
		window.addEventListener('click', resumeAudio);
		window.addEventListener('keydown', resumeAudio);
		window.addEventListener('touchstart', resumeAudio); // Add touchstart for mobile
	});
</script>

{#if audioContextSuspended}
	<div
		style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; color: white; font-family: sans-serif;"
	>
		<div style="text-align: center;">
			<h1>Tap to Enable Audio</h1>
			<p>Browser requires interaction to play sound.</p>
		</div>
	</div>
{/if}

<T.PerspectiveCamera makeDefault fov={75} near={0.1} far={1000}>
	<T.AudioListener
		oncreate={(ref) => {
			audioListener.set(ref);
			// Check state immediately
			if (ref.context.state === 'suspended') audioContextSuspended = true;
		}}
	/>
	{#if network.isAgent}
		<AgentController object={capsule} bind:movement />
	{:else}
		<Controller object={capsule} {movement} />
	{/if}
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
	<Character
		{movement}
		{grounded}
		character="anon"
		color={randomColor}
		metalness={randomMetalness}
		roughness={randomRoughness}
	/>
</T.Group>
