<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { Camera, Vector2, Vector3, Quaternion } from 'three';
	import { useThrelte, useParent, useTask } from '@threlte/core';

	const { camera } = useThrelte();
	// const camera = useParent();

	export let object: any;
	export let rotateSpeed = 1.0;

	export let idealOffset = { x: -0.5, y: 2, z: -4 };
	export let idealLookAt = { x: 0, y: 1, z: 5 };

	const currentPosition = new Vector3();
	const currentLookAt = new Vector3();

	let isOrbiting = false;
	let pointerDown = false;

	const rotateStart = new Vector2();
	const rotateEnd = new Vector2();
	const rotateDelta = new Vector2();

	const axis = new Vector3(0, 1, 0);
	const rotationQuat = new Quaternion();

	const { renderer, invalidate } = useThrelte();
	if (!renderer) throw new Error();

	const domElement = renderer.domElement;

	const dispatch = createEventDispatcher();

	if (!renderer)
		throw new Error('Threlte Context missing: Is <PointerLockControls> a child of <Canvas>?');

	if (!($camera instanceof Camera)) {
		throw new Error('Parent missing: <PointerLockControls> need to be a child of a <Camera>');
	}

	domElement.addEventListener('pointerdown', onPointerDown);
	domElement.addEventListener('pointermove', onPointerMove);
	domElement.addEventListener('pointerleave', onPointerLeave);
	domElement.addEventListener('pointerup', onPointerUp);

	onDestroy(() => {
		domElement.removeEventListener('pointerdown', onPointerDown);
		domElement.removeEventListener('pointermove', onPointerMove);
		domElement.removeEventListener('pointerleave', onPointerLeave);
		domElement.removeEventListener('pointerup', onPointerUp);
	});

	// This is basically your update function
	useTask(
		'thirdPersonCamera',
		(delta) => {
			const cam = camera.current;

			if (!object || !cam) return;

			rotationQuat.setFromAxisAngle(axis, -rotateDelta.x * rotateSpeed * delta);
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
			// calculate distance from init down
			const distCheck =
				Math.sqrt(Math.pow(x - rotateStart.x, 2) + Math.pow(y - rotateStart.y, 2)) > 10;
			if (distCheck) {
				isOrbiting = true;
			}
		}
		if (!isOrbiting) return;

		rotateEnd.set(x, y);
		rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(rotateSpeed);
		rotateStart.copy(rotateEnd);

		// invalidate('PointerLockcontrols: change event');
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
		// console.log('object', object);
		ideal.applyQuaternion(object.quaternion);
		ideal.add(new Vector3(object.position.x, object.position.y, object.position.z));
		return ideal;
	}

	function onKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'a':
				rotateDelta.x = -2 * rotateSpeed;
				break;
			case 'd':
				rotateDelta.x = 2 * rotateSpeed;
				break;
			default:
				break;
		}
	}

	function onKeyUp(event: KeyboardEvent) {
		switch (event.key) {
			case 'a':
				rotateDelta.x = 0;
				break;
			case 'd':
				rotateDelta.x = 0;
				break;
			default:
				break;
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />
