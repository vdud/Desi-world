<!-- lib/controllers/MovementController.svelte -->
<script lang="ts">
	import { useTask } from '@threlte/core';
	import { useRapier } from '@threlte/rapier';
	import { Ray } from '@dimforge/rapier3d-compat'; // <-- IMPORT RAY
	import type { RigidBody } from '@dimforge/rapier3d-compat';
	import { rawInput, isLocked, isGrounded, controllerState } from './ControllerState';
	import { ControllerConfig } from './ControllerConfig';
	import { PhysicsState } from './ControllerState';
	import { Vector3 } from 'three';

	export let rigidBody: RigidBody;

	const { world } = useRapier();
	const physics = new PhysicsState();
	const down = new Vector3(0, -1, 0);
	const playerPos = new Vector3();

	function applySmoothing(target: number, current: number, delta: number, accel: number): number {
		const speed = accel * delta;
		if (Math.abs(target - current) < speed) return target;
		return current + Math.sign(target - current) * speed;
	}

	useTask(
		'physics',
		(delta) => {
			if ($isLocked || !rigidBody) return;

			const input = $rawInput;

			const maxSpeed = input.run ? ControllerConfig.maxRunSpeed : ControllerConfig.maxWalkSpeed;
			physics.targetVelocity.x = input.x * maxSpeed;
			physics.targetVelocity.z = input.z * maxSpeed;

			physics.velocity.x = applySmoothing(
				physics.targetVelocity.x,
				physics.velocity.x,
				delta,
				input.x !== 0 ? ControllerConfig.acceleration : ControllerConfig.deceleration
			);
			physics.velocity.z = applySmoothing(
				physics.targetVelocity.z,
				physics.velocity.z,
				delta,
				input.z !== 0 ? ControllerConfig.acceleration : ControllerConfig.deceleration
			);

			// **CORRECT RAY OBJECT**
			const rbPos = rigidBody.translation();
			playerPos.set(rbPos.x, rbPos.y, rbPos.z);
			const ray = new Ray(playerPos, down); // <-- PROPER RAY INSTANCE

			const hit = world.castRay(ray, ControllerConfig.groundedThreshold, true);

			const currentVel = rigidBody.linvel();
			physics.grounded = hit !== null && Math.abs(currentVel.y) < 0.1;

			if (input.y > 0 && physics.grounded) {
				physics.velocity.y = ControllerConfig.jumpImpulse;
			} else {
				physics.velocity.y = currentVel.y;
			}

			rigidBody.setLinvel(physics.velocity, true);

			isGrounded.set(physics.grounded);

			const horizontalSpeed = Math.hypot(input.x, input.z);
			const newState = physics.grounded
				? horizontalSpeed === 0
					? 'idle'
					: input.run
						? 'running'
						: 'walking'
				: 'airborne';

			controllerState.set(newState);
		},
		{ before: 'camera' }
	);
</script>
