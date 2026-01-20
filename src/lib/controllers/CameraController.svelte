<!-- lib/controllers/CameraController.svelte -->
<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import { useRapier } from '@threlte/rapier';
	import { Ray } from '@dimforge/rapier3d-compat'; // <-- USE RAY FOR CAMERA TOO
	import { mouseDelta, isLocked } from './ControllerState';
	import { ControllerConfig } from './ControllerConfig';
	import { Vector3 } from 'three';
	import type { Object3D } from 'three';

	export let target: Object3D;

	const { camera } = useThrelte();
	const { world } = useRapier();

	const spherical = { theta: 0, phi: Math.PI / 4, radius: ControllerConfig.cameraArmLength };
	const spring = { position: new Vector3(), velocity: new Vector3() };
	const origin = new Vector3();
	const direction = new Vector3();
	const finalPosition = new Vector3();

	let yaw = 0;
	let pitch = Math.PI / 6;

	useTask(
		'camera',
		(delta) => {
			if ($isLocked || !target) return;

			const mouse = $mouseDelta;
			yaw -= mouse.x;
			pitch -= mouse.y;

			pitch = Math.max(
				ControllerConfig.cameraMinPitch,
				Math.min(ControllerConfig.cameraMaxPitch, pitch)
			);

			const ideal = new Vector3();
			ideal.setFromSphericalCoords(spherical.radius, pitch, yaw);
			ideal.add(target.position);

			const dx = ideal.sub(spring.position);
			const acceleration = dx.multiplyScalar(ControllerConfig.cameraSpring.stiffness);
			spring.velocity.add(acceleration.multiplyScalar(delta));
			spring.velocity.multiplyScalar(1 - ControllerConfig.cameraSpring.damping * delta);
			spring.position.add(spring.velocity.clone().multiplyScalar(delta));

			origin.copy(target.position);
			direction.copy(spring.position).sub(origin).normalize();
			const maxDist = origin.distanceTo(spring.position);

			// **USE RAY FOR STABLE TYPING**
			const ray = new Ray(origin, direction); // <-- PROPER RAY
			const hit = world.castRay(ray, maxDist, true);

			const hitDistance = hit ? hit.toi : maxDist; // <-- hit.toi WORKS WITH RAY

			finalPosition.copy(origin).add(direction.multiplyScalar(hitDistance));

			camera.current.position.copy(finalPosition);
			camera.current.lookAt(target.position);

			mouseDelta.set({ x: 0, y: 0 });
		},
		{ after: 'physics' }
	);
</script>
