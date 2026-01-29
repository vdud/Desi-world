<!-- src/lib/components/Player/Player Controller/ThirdPersonControls.svelte -->
<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { Camera, Vector2, Vector3, Quaternion } from 'three';
	import { useThrelte, useTask } from '@threlte/core';

	const { camera } = useThrelte();

	const { object, movement } = $props();

	let idealOffset = { x: -0.5, y: 2, z: -4 };
	let idealLookAt = { x: 0, y: 1, z: 5 };

	const currentPosition = new Vector3();
	const currentLookAt = new Vector3();

	let isOrbiting = false;
	let pointerDown = false;

	// Mouse rotation tracking only
	const rotateStart = new Vector2();
	const rotateEnd = new Vector2();
	const rotateDelta = new Vector2(); // Mouse delta only

	const axis = new Vector3(0, 1, 0);
	const rotationQuat = new Quaternion();

	const { renderer, invalidate } = useThrelte();
	if (!renderer) throw new Error();

	const domElement = renderer.domElement;

	const dispatch = createEventDispatcher();

	if (!renderer)
		throw new Error('Threlte Context missing: Is <ThirdPersonControls> a child of <Canvas>?');

	if (!($camera instanceof Camera)) {
		throw new Error('Parent missing: <ThirdPersonControls> need to be a child of a <Camera>');
	}

	onMount(() => {
		domElement.addEventListener('pointerdown', onPointerDown);
		domElement.addEventListener('pointermove', onPointerMove);
		domElement.addEventListener('pointerleave', onPointerLeave);
		domElement.addEventListener('pointerup', onPointerUp);
	});
	onDestroy(() => {
		domElement.removeEventListener('pointerdown', onPointerDown);
		domElement.removeEventListener('pointermove', onPointerMove);
		domElement.removeEventListener('pointerleave', onPointerLeave);
		domElement.removeEventListener('pointerup', onPointerUp);
	});

	useTask(
		'thirdPersonCamera',
		(delta) => {
			const cam = camera.current;

			if (!object || !cam) return;

			// Combine mouse and keyboard rotation, then apply speed and delta time once
			const totalRotationX =
				(rotateDelta.x + movement.rotation.rotateDelta.x) * movement.rotation.rotateSpeed;

			rotationQuat.setFromAxisAngle(axis, -totalRotationX * delta);
			object.quaternion.multiply(rotationQuat);

			const offset = vectorFromObject(idealOffset);
			const lookAt = vectorFromObject(idealLookAt);

			const t = 1.0 - Math.pow(0.001, delta);
			currentPosition.lerp(offset, t);
			currentLookAt.lerp(lookAt, t);

			cam.position.copy(currentPosition);
			cam.lookAt(currentLookAt);
		},
		{ after: 'camera' }
	);

	function onPointerMove(event: PointerEvent) {
		const { x, y } = event;
		if (pointerDown && !isOrbiting) {
			const distCheck =
				Math.sqrt(Math.pow(x - rotateStart.x, 2) + Math.pow(y - rotateStart.y, 2)) > 10;
			if (distCheck) {
				isOrbiting = true;
			}
		}
		if (!isOrbiting) return;

		rotateEnd.set(x, y);
		// Store raw mouse delta (speed will be applied in useTask)
		rotateDelta.subVectors(rotateEnd, rotateStart);
		rotateStart.copy(rotateEnd);

		invalidate();
		dispatch('change');
	}

	function onPointerDown(event: PointerEvent) {
		const { x, y } = event;
		rotateStart.set(x, y);
		pointerDown = true;
	}

	function onPointerUp() {
		rotateDelta.set(0, 0);
		pointerDown = false;
		isOrbiting = false;
	}

	function onPointerLeave() {
		rotateDelta.set(0, 0);
		pointerDown = false;
		isOrbiting = false;
	}

	function vectorFromObject(vec: { x: number; y: number; z: number }) {
		const { x, y, z } = vec;
		const ideal = new Vector3(x, y, z);
		ideal.applyQuaternion(object.quaternion);
		ideal.add(new Vector3(object.position.x, object.position.y, object.position.z));
		return ideal;
	}
</script>
