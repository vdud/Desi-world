// lib/controllers/InputManager.ts
import { onMount, onDestroy } from 'svelte';
import { rawInput, mouseDelta } from './ControllerState';
import { ControllerConfig } from './ControllerConfig';

export function setupInputManager() {
	const state = { x: 0, y: 0, z: 0, run: false };
	let lastKeyTime = 0;

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Tab') return;

		const now = performance.now();
		if (now - lastKeyTime < ControllerConfig.keyboardDeadzoneMs) return;
		lastKeyTime = now;

		switch (e.key.toLowerCase()) {
			case 'w':
				state.z = 1;
				break;
			case 's':
				state.z = -1;
				break;
			case 'a':
				state.x = -1;
				break;
			case 'd':
				state.x = 1;
				break;
			case 'shift':
				state.run = true;
				break;
			case ' ':
				e.preventDefault();
				state.y = 1;
				break;
		}
		rawInput.set({ ...state });
	};

	const onKeyUp = (e: KeyboardEvent) => {
		switch (e.key.toLowerCase()) {
			case 'w':
				if (state.z === 1) state.z = 0;
				break;
			case 's':
				if (state.z === -1) state.z = 0;
				break;
			case 'a':
				if (state.x === -1) state.x = 0;
				break;
			case 'd':
				if (state.x === 1) state.x = 0;
				break;
			case 'shift':
				state.run = false;
				break;
			case ' ':
				state.y = 0;
				break;
		}
		rawInput.set({ ...state });
	};

	const onPointerLockChange = () => {
		// UI state updates
	};

	const onMouseMove = (e: MouseEvent) => {
		if (!document.pointerLockElement) return;
		mouseDelta.set({
			x: e.movementX * ControllerConfig.mouseSensitivity,
			y: e.movementY * ControllerConfig.mouseSensitivity
		});
	};

	const cleanup = () => {
		window.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('keyup', onKeyUp);
		document.removeEventListener('pointerlockchange', onPointerLockChange);
		document.removeEventListener('mousemove', onMouseMove);
	};

	onMount(() => {
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		document.addEventListener('pointerlockchange', onPointerLockChange);
		document.addEventListener('mousemove', onMouseMove);
	});

	onDestroy(cleanup);

	return cleanup;
}
