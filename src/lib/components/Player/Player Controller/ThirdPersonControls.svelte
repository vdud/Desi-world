<!-- ThirdPersonControls.svelte -->
<script lang="ts">
	import { Camera, Vector2, Vector3, Quaternion, Euler } from 'three';
	import { useThrelte, useTask } from '@threlte/core';
	import { onMount, onDestroy } from 'svelte';

	const { camera, renderer } = useThrelte();

	// Props with defaults to prevent undefined errors
	const { object, movement } = $props<{
		object?: any;
		movement?: {
			forward?: number;
			backward?: number;
			left?: number;
			right?: number;
			up?: number;
			rotation?: { rotateDelta?: Vector2; rotateSpeed?: number };
		};
	}>();

	// Camera configuration
	const idealOffset = new Vector3(0, 3, -5);
	const idealLookAt = new Vector3(0, 1, 0);

	// Current camera state
	const currentPos = new Vector3(0, 5, -10);
	const currentLook = new Vector3(0, 0, 0);
	let isInitialized = false;

	// Mouse input
	let rotateDelta = 0;
	let isDragging = false;
	let lastMouseX = 0;

	const axis = new Vector3(0, 1, 0);
	const rotationQuat = new Quaternion();

	// Initialize camera immediately when object becomes available
	$effect(() => {
		if (object && camera.current && !isInitialized) {
			// Hard snap to initial position immediately
			const offset = idealOffset.clone().applyQuaternion(object.quaternion).add(object.position);
			const look = object.position.clone().add(new Vector3(0, 1, 0));

			currentPos.copy(offset);
			currentLook.copy(look);

			camera.current.position.copy(currentPos);
			camera.current.lookAt(currentLook);

			isInitialized = true;
		}
	});

	// Input handlers
	function onPointerDown(e: PointerEvent) {
		isDragging = true;
		lastMouseX = e.clientX;
		domElement?.setCapture?.(); // Firefox compatibility
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const delta = e.clientX - lastMouseX;
		rotateDelta += delta * 0.005; // sensitivity
		lastMouseX = e.clientX;
	}

	function onPointerUp() {
		isDragging = false;
		rotateDelta = 0;
	}

	let domElement: HTMLElement | undefined = renderer?.domElement;

	onMount(() => {
		domElement?.addEventListener('pointerdown', onPointerDown);
		domElement?.addEventListener('pointermove', onPointerMove);
		domElement?.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointerup', onPointerUp); // Safety cleanup
	});

	onDestroy(() => {
		domElement?.removeEventListener('pointerdown', onPointerDown);
		domElement?.removeEventListener('pointermove', onPointerMove);
		domElement?.removeEventListener('pointerup', onPointerUp);
		window.removeEventListener('pointerup', onPointerUp);
	});

	useTask((delta) => {
		// Safety check - if no object or camera, exit immediately
		if (!object || !camera.current) return;

		// Apply rotation from mouse (once per move) + keyboard (continuous)
		const keyboardRot = (movement?.rotation?.rotateDelta?.x || 0) * delta;
		const totalRot = rotateDelta + keyboardRot;

		if (totalRot !== 0) {
			rotationQuat.setFromAxisAngle(axis, -totalRot);
			object.quaternion.multiply(rotationQuat);
		}
		rotateDelta = 0; // Clear mouse input

		// Calculate desired camera position based on object
		const offset = idealOffset.clone().applyQuaternion(object.quaternion).add(object.position);
		const lookAt = idealLookAt.clone().applyQuaternion(object.quaternion).add(object.position);

		// Hard snap if too far (spawn/respawn), otherwise smooth lerp
		const dist = currentPos.distanceTo(offset);
		const alpha = dist > 10 ? 1.0 : 0.15; // 1.0 = instant, 0.15 = smooth

		currentPos.lerp(offset, alpha);
		currentLook.lerp(lookAt, alpha);

		// Apply to camera
		camera.current.position.copy(currentPos);
		camera.current.lookAt(currentLook);
	});
</script>
