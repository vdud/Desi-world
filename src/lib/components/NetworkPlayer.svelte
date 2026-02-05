<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Collider, RigidBody, CollisionGroups } from '@threlte/rapier';
	import type * as THREE from 'three';
	import Character from './Player/Character.svelte';
	import { network, type PlayerState } from '$lib/network/network.svelte';
	import { audioListener } from '$lib/stores/commonStores';

	let props = $props<{ state: PlayerState }>();

	// Interpolation logic could go here, for now we direct map
	// To make it smooth, we could use a spring or lerp in useTask

	let currentX = $state(props.state.x);
	let currentY = $state(props.state.y);
	let currentZ = $state(props.state.z);
	let currentRot = $state(props.state.rotation);

	let stream = $derived(network.voiceStreams.get(props.state.id));

	/*
	 * Helper Action to set srcObject on Audio Element
	 */
	function srcObject(node: HTMLAudioElement, stream: MediaStream) {
		node.srcObject = stream;
		node.play().catch((e) => console.error('Auto-play failed:', e));
		return {
			update(newStream: MediaStream) {
				if (newStream !== stream) {
					node.srcObject = newStream;
					node.play().catch((e) => console.error('Auto-play failed:', e));
				}
			}
		};
	}

	useTask((delta) => {
		const target = props.state;
		// ...
		// (keep existing interpolation logic)
		const t = Math.min(10 * delta, 1);
		currentX += (target.x - currentX) * t;
		currentY += (target.y - currentY) * t;
		currentZ += (target.z - currentZ) * t;

		// Rotation lerp (handle wrap around)
		let diff = target.rotation - currentRot;
		if (diff > Math.PI) diff -= Math.PI * 2;
		if (diff < -Math.PI) diff += Math.PI * 2;
		currentRot += diff * t;
	});
</script>

<!-- 
  We use a Kinematic RigidBody for network players so they:
  1. Have collision (can block the local player)
  2. Don't fall due to local gravity (position is controlled by server/network)
-->
<T.Group position={[currentX, currentY, currentZ]} rotation.y={currentRot + Math.PI}>
	{#if stream && $audioListener}
		<!-- 3D Spatial Audio -->
		<T.PositionalAudio
			args={[$audioListener]}
			refDistance={20}
			rolloffFactor={1}
			oncreate={(ref: THREE.PositionalAudio) => {
				console.log(
					'🔊 Creating PositionalAudio for stream:',
					stream.id,
					'Active:',
					stream.active,
					'Tracks:',
					stream.getAudioTracks().length
				);
				if (stream) ref.setMediaStreamSource(stream);
				ref.setVolume(1.0);
			}}
		/>

		<!-- FALLBACK / DEBUG AUDIO -->
		<audio use:srcObject={stream} autoplay playsinline style="display:none;"></audio>
	{/if}
	<RigidBody type="kinematicPosition" position={[currentX, currentY, currentZ]}>
		<CollisionGroups groups={[0]}>
			<Collider shape={'capsule'} args={[0.55, 0.3]} />
		</CollisionGroups>
	</RigidBody>

	<!-- Visuals -->
	<Character
		movement={props.state.movement}
		grounded={props.state.grounded}
		character={props.state.character}
	/>
</T.Group>
