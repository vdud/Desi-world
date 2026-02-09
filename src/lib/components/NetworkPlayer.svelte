<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Collider, RigidBody, CollisionGroups } from '@threlte/rapier';
	import { Text } from '@threlte/extras';
	import type * as THREE from 'three';
	import Character from './Player/Character.svelte';
	import { network, type PlayerState } from '$lib/network/network.svelte';
	import { audioListener } from '$lib/stores/commonStores';
	import ChatBubble from './ChatBubble.svelte';

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

```typescript
<!-- 
  We use a Kinematic RigidBody for network players so they:
  1. Have collision (can block the local player)
  2. Don't fall due to local gravity (position is controlled by server/network)
-->
<T.Group position={[currentX, currentY, currentZ]} rotation.y={currentRot + Math.PI}>
	{#if props.state.isAgent}
		<Text
			text="[BOT]"
			position={[0, 2.6, 0]}
			fontSize={0.3}
			color="#ff00ff"
			anchorX="center"
			anchorY="middle"
			billboard
		/>
	{/if}

	{#if stream && $audioListener}
		<!-- 3D Spatial Audio -->
		<T.PositionalAudio
			args={[$audioListener]}
			refDistance={1}
			maxDistance={25}
			distanceModel="linear"
			panningModel="HRTF"
			oncreate={(ref: THREE.PositionalAudio) => {
				if (stream) {
					const tracks = stream.getAudioTracks();

					if (tracks.length > 0) {
						ref.setMediaStreamSource(stream);
						ref.setVolume(2.0); // Boost volume
						// Ensure the context is running
						if (ref.context.state === 'suspended') {
							console.warn('   - AudioContext suspended! Attempting resume...');
							ref.context.resume();
						}
					} else {
						console.warn('   - No audio tracks found in stream!');
					}
				}
			}}
		/>

		<!-- FALLBACK / DEBUG AUDIO - Visible for testing -->
		<div
			style="position: absolute; top: 10px; left: 10px; z-index: 9999; background: rgba(0,0,0,0.8); color: white; padding: 10px; pointer-events: auto;"
		>
			<strong>Debug Audio: {props.state.id}</strong><br />
			Stream Active: {stream.active}<br />
			Tracks: {stream.getAudioTracks().length}<br />
			<!-- Muted by default so it doesn't override spatial audio -->
			<audio use:srcObject={stream} playsinline controls muted style="width: 200px; height: 30px;"
			></audio>
		</div>
	{/if}

	<!-- DEBUG INDICATOR: Red = No Audio Stream, Green = Audio Stream Active -->
	<T.Mesh position={[0, 2.2, 0]}>
		<T.SphereGeometry args={[0.15]} />
		<T.MeshBasicMaterial
			color={stream && stream.getAudioTracks().length > 0 ? '#00ff00' : '#ff0000'}
		/>
	</T.Mesh>

	{#if props.state.showChatBubble}
		<ChatBubble text={props.state.lastChatMessage} />
	{/if}

	<RigidBody type="kinematicPosition">
		<CollisionGroups groups={[0]}>
			<Collider shape={'capsule'} args={[0.55, 0.3]} />
		</CollisionGroups>
	</RigidBody>

	<!-- Visuals -->
	<Character
		movement={props.state.movement}
		grounded={props.state.grounded}
		character={props.state.character}
		color={props.state.color}
		metalness={props.state.metalness}
		roughness={props.state.roughness}
	/>
</T.Group>
