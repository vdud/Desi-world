<!-- lib/ThirdPersonController.svelte -->
<script lang="ts">
	import { T } from '@threlte/core';
	import { RigidBody, Collider, CollisionGroups } from '@threlte/rapier';
	import { setupInputManager } from './controllers/InputManager';
	import { isLocked } from './controllers/ControllerState';
	import MovementController from './controllers/MovementController.svelte';
	import CameraController from './controllers/CameraController.svelte';
	import AnimationController from './controllers/AnimationController.svelte';
	import type { Group } from 'three';
	import type { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat';
	import { onDestroy } from 'svelte';

	// SVELTE 5 PROPS RUNE
	let { position = [0, 2, 0] as [number, number, number], radius = 0.3, height = 1.8 } = $props();

	// SVELTE 5 BINDABLE STATE
	let rigidBody = $state<RapierRigidBody | null>(null);
	let characterRoot = $state<Group | null>(null);

	const cleanup = setupInputManager();
	onDestroy(cleanup);
</script>

{#if characterRoot && rigidBody}
	<T.Group ref={characterRoot} {position}>
		<RigidBody ref={rigidBody} enabledRotations={[false, false, false]} type="dynamic">
			<CollisionGroups groups={[0]}>
				<Collider shape="capsule" args={[height / 2 - radius, radius]} />
			</CollisionGroups>

			<MovementController {rigidBody} />
			<CameraController target={characterRoot} />
			<AnimationController />
		</RigidBody>
	</T.Group>
{/if}

{#if !$isLocked}
	<div class="ui-hint">Click screen to control • ESC to unlock • WASD to move • SPACE to jump</div>
{/if}

<style>
	.ui-hint {
		position: fixed;
		top: 1rem;
		left: 1rem;
		color: white;
		background: rgba(0, 0, 0, 0.7);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		pointer-events: none;
		font-family: system-ui, sans-serif;
		font-size: 0.875rem;
	}
</style>
