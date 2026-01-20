<script lang="ts">
	import { onDestroy } from 'svelte';
	import { GLTF, useGltfAnimations } from '@threlte/extras';
	import { buttonIdle, buttonWalk, buttonRun } from './state';
	import { debounce } from '$lib/bigFunctions/debounce';
	import { MeshStandardMaterial, Quaternion, SphereGeometry, Vector2, Vector3 } from 'three';
	import { useParent, T } from '@threlte/core';
	import { backward, forward, left, right } from '$lib/stores/characterControlMovement';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';

	let currentActionKey = 'idle';
	// export let object: any;
	let scene: any;

	const { gltf, actions } = useGltfAnimations();

	$: $actions[currentActionKey]?.play();

	// const unsub1 = buttonIdle.subscribe(() => {
	// 	console.log('transition to idle');
	// 	transitionTo('idle', 0.3);
	// });

	// const unsub2 = buttonWalk.subscribe(() => {
	// 	console.log('transition to run');
	// 	transitionTo('walk', 0.3);
	// });

	// const unsub3 = buttonRun.subscribe(() => {
	// 	console.log('transition to run');
	// 	transitionTo('run', 0.3);
	// });

	let idealOffset = { x: -0.5, y: 2, z: -3 };
	let idealLookAt = { x: 0, y: 1, z: 5 };

	const rotationQuat = new Quaternion();
	const axis = new Vector3(0, 1, 0);

	const currentPosition = new Vector3();
	const currentLookAt = new Vector3();

	const camera = useParent();
	let character;

	let rotate = DEG2RAD;

	// useFrame((_, delta) => {
	// 	const t = 1.0 - Math.pow(0.001, delta);
	// console.log('delta', delta);
	// console.log('t', t);
	// // the object's position is bound to the prop
	// // console.log('framing');

	// // camera is based on character so we rotation character first
	// rotationQuat.setFromAxisAngle(axis, -rotateDelta.x * rotateSpeed * delta);
	// // object.quaternion.multiply(rotationQuat);

	// // // then we calculate our ideal's
	// const offset = vectorFromObject(idealOffset);
	// const lookAt = vectorFromObject(idealLookAt);
	// // console.log('offSet', lookAt);

	// // // and how far we should move towards them
	// const t = 1.0 - Math.pow(0.001, delta);
	// currentPosition.lerp(offset, t);
	// currentLookAt.lerp(lookAt, t);

	// rotate = currentPosition;
	// console.log('rotate', currentPosition);
	// // console.log('currentPosition', currentPosition);
	// // // then finally set the camera
	// // $camera!.position.copy(currentPosition);
	// // $camera!.lookAt(currentLookAt);
	// });

	function vectorFromObject(vec: { x: number; y: number; z: number }) {
		const { x, y, z } = vec;
		const ideal = new Vector3(x, y, z);
		ideal.applyQuaternion(object.quaternion);
		ideal.add(new Vector3(object.position.x, object.position.y, object.position.z));
		return ideal;
	}

	function transitionTo(nextActionKey: string, duration = 1) {
		const currentAction = $actions[currentActionKey];
		const nextAction = $actions[nextActionKey];
		if (!nextAction || currentAction === nextAction) return;
		// Function inspired by: https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_blending.html
		nextAction.enabled = true;
		if (currentAction) {
			currentAction.crossFadeTo(nextAction, duration, true);
		}
		// Not sure why I need this but the source code does not
		nextAction.play();
		currentActionKey = nextActionKey;
	}

	// onDestroy(() => {
	// 	// We unsubscribe otherwise we'd have old subscriptions still active
	// 	unsub1();
	// 	unsub2();
	// 	unsub3();
	// });

	let holdFrames = 0;
	let isKeyDown = false;

	const rotateDelta = new Vector2();

	let rotateSpeed = 1.0;

	// if ($forward === 1) {
	// 	rotate = 0 * DEG2RAD;
	// 	transitionTo('walk', 0.3);
	// }
	// if ($backward === 1) {
	// 	rotate = 180 * DEG2RAD;
	// 	transitionTo('walk', 0.3);
	// }

	function backwardTransitionIn() {
		rotate = 180 * DEG2RAD;
		transitionTo('walk', 0.3);
	}
	function backwardTransitionOut() {
		rotate = 0 * DEG2RAD;
		transitionTo('idle', 0.3);
	}

	$: $forward === 0 ? transitionTo('idle', 0.3) : transitionTo('run', 0.3);
	$: $backward === 1 ? backwardTransitionIn() : backwardTransitionOut();

	const keyDownEvent = (e: KeyboardEvent) => {
		// allfalse();

		// switch (e.key) {
		// 	case 'w': // w
		// 		forward = true;
		// 		// console.log('foreward Down');
		// 		transitionTo('walk', 0.3);
		// 		break;
		// 	case 'a': // a
		// 		left = true;
		// 		break;
		// 	case 's': // s
		// 		backward = true;
		// 		break;
		// 	case 'd': // d
		// 		right = true;
		// 		break;
		// 	case 'Space': // SPACE
		// 		space = true;
		// 		break;
		// 	case 'Shift': // SHIFT
		// 		shift = true;
		// 		transitionTo('run', 0.3);
		// 		break;
		// }

		// if (e.key === 'w') {
		// 	// setTimeout(() => {
		// 	transitionTo('walk', 0.3);
		// 	// }, 300);
		// }
		// if (e.key === 'Shift') {
		// 	// setTimeout(() => {
		// 	transitionTo('run', 0.3);
		// 	// }, 300);
		// }

		switch (e.key) {
			// case 'w':
			// 	rotate = 0 * DEG2RAD;
			// 	transitionTo('walk', 0.3);
			// 	break;
			// case 's':
			// 	rotate = 180 * DEG2RAD;
			// 	transitionTo('walk', 0.3);
			// 	break;

			case 'Shift':
				transitionTo('run', 0.3);
				break;

			default:
				break;
		}

		// if (e.key === 'a' && !isKeyDown) {
		// 	// prevent def
		// 	e.preventDefault();
		// 	isKeyDown = true;
		// 	// Start counting frames when 'a' key is pressed
		// 	holdFrames = 0;
		// 	incrementRotateA();
		// }
		// if (e.key === 'd' && !isKeyDown) {
		// 	isKeyDown = true;
		// 	e.preventDefault();
		// 	// Start counting frames when 'a' key is pressed
		// 	holdFrames = 0;
		// 	incrementRotateS();
		// }
	};
	const handleKeyUp = (e: KeyboardEvent) => {
		// allfalse();

		// switch (e.key) {
		// 	case 'w': // w
		// 		forward = true;
		// 		// console.log('foreward Down');
		// 		transitionTo('idle', 0.3);
		// 		break;
		// 	case 'a': // a
		// 		left = true;
		// 		break;
		// 	case 's': // s
		// 		backward = true;
		// 		break;
		// 	case 'd': // d
		// 		right = true;
		// 		break;
		// 	case 'Space': // SPACE
		// 		space = true;
		// 		break;
		// 	case 'Shift': // SHIFT
		// 		shift = true;
		// 		transitionTo('walk', 0.3);
		// 		break;
		// }

		// if (e.key === 'w') {
		// 	// setTimeout(() => {
		// 	transitionTo('idle', 0.2);
		// 	// }, 500);
		// }

		// if (e.key === 'Shift') {
		// 	// 	// setTimeout(() => {
		// 	// 	transitionTo('idle', 0.2);
		// 	// 	// }, 500);
		// 	return;
		// }

		// if (e.key === 'a' || e.key === 'd') {
		// 	// setTimeout(() => {
		// 	isKeyDown = false;
		// 	// }, 300);
		// }
		switch (e.key) {
			// case 'w':
			// 	transitionTo('idle', 0.3);
			// 	break;
			// case 's':
			// 	rotate = 0 * DEG2RAD;
			// 	transitionTo('idle', 0.3);
			// 	break;
			case 'Shift':
				if ($forward === 0) {
					transitionTo('idle', 0.3);
				} else {
					transitionTo('walk', 0.3);
				}
				break;

			default:
				break;
		}
	};

	// function incrementRotateS() {
	// 	if (isKeyDown) {
	// 		rotate -= 0.001;
	// 		holdFrames++;
	// 		// Perform any other actions you need here

	// 		// Request the next frame
	// 		requestAnimationFrame(incrementRotateS);
	// 	}
	// }

	// function incrementRotateA() {
	// 	if (isKeyDown) {
	// 		rotate += 0.001;
	// 		holdFrames++;
	// 		// Perform any other actions you need here

	// 		// Request the next frame
	// 		requestAnimationFrame(incrementRotateA);
	// 	}
	// }

	// const debouncedKeyDownEvent = debounce(keyDownEvent, 300);
</script>

<!-- <svelte:window on:keydown={keyDownEvent} on:keyup={handleKeyUp} /> -->

<!-- <GLTF
	position={[0, -0.86, 0]}
	rotation.y={rotate}
	castShadow
	receiveShadow
	bind:gltf={$gltf}
	url="https://threejs.org/examples/models/gltf/Xbot.glb"
/> -->

<T.Mesh receiveShadow castShadow>
	<GLTF
		castShadow
		receiveShadow
		url="https://threejs.org/examples/models/gltf/Xbot.glb"
		position={[0, -0.86, 0]}
		rotation.y={rotate}
		bind:gltf={$gltf}
	/>
</T.Mesh>
