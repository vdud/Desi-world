<script lang="ts">
	import { type Vector2 } from 'three';
	import ActionButtons from './ActionButtons.svelte';

	interface MovementState {
		forward: number;
		backward: number;
		left: number;
		right: number;
		up: number;
		rotation: {
			rotateDelta: Vector2;
			rotateSpeed: number;
		};
	}

	interface Props {
		movement: MovementState;
		onMovementChange: (direction: keyof Omit<MovementState, 'rotation'>, value: number) => void;
	}

	let { movement, onMovementChange }: Props = $props();

	// --- Joystick State ---
	const MAX_RADIUS = 50;
	const DEADZONE = 0.15;
	const ROTATION_DEADZONE = 0.25;

	let activeTouchId: number | null = $state(null);
	let origin = $state({ x: 0, y: 0 });
	let current = $state({ x: 0, y: 0 });
	let clampedPos = $state({ x: 0, y: 0 });

	function handlePointerStart(e: PointerEvent) {
		if (e.button !== 0) return;
		// If clicking on UI elements that stop propagation, this won't fire if they handle it.
		// But in this new structure, this div is a sibling to UI.
		// We rely on z-index. This div is z-100. Buttons are z-105.

		activeTouchId = e.pointerId;
		origin = { x: e.clientX, y: e.clientY };
		current = { x: e.clientX, y: e.clientY };
		clampedPos = { x: 0, y: 0 };
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (activeTouchId !== e.pointerId) return;
		current = { x: e.clientX, y: e.clientY };
		updateMovementState();
	}

	function handlePointerEnd(e: PointerEvent) {
		if (activeTouchId !== e.pointerId) return;
		activeTouchId = null;
		clampedPos = { x: 0, y: 0 };

		onMovementChange('forward', 0);
		onMovementChange('backward', 0);
		onMovementChange('left', 0);
		onMovementChange('right', 0);
		movement.rotation.rotateDelta.x = 0;
	}

	function updateMovementState() {
		const dx = current.x - origin.x;
		const dy = current.y - origin.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		let visualX = dx;
		let visualY = dy;
		if (distance > MAX_RADIUS) {
			const ratio = MAX_RADIUS / distance;
			visualX = dx * ratio;
			visualY = dy * ratio;
		}
		clampedPos = { x: visualX, y: visualY };

		const inputX = visualX / MAX_RADIUS;
		const inputY = visualY / MAX_RADIUS;

		if (Math.abs(inputX) < DEADZONE && Math.abs(inputY) < DEADZONE) {
			onMovementChange('forward', 0);
			onMovementChange('backward', 0);
			onMovementChange('left', 0);
			onMovementChange('right', 0);
			movement.rotation.rotateDelta.x = 0;
			return;
		}

		const moveAmount = Math.min(Math.abs(inputY) / (1 - DEADZONE), 1);

		if (inputY < -DEADZONE) {
			onMovementChange('forward', moveAmount);
			onMovementChange('backward', 0);
		} else if (inputY > DEADZONE) {
			onMovementChange('backward', moveAmount);
			onMovementChange('forward', 0);
		} else {
			onMovementChange('forward', 0);
			onMovementChange('backward', 0);
		}

		if (Math.abs(inputX) > ROTATION_DEADZONE) {
			const rotationAmount = (Math.abs(inputX) - ROTATION_DEADZONE) / (1 - ROTATION_DEADZONE);
			const isMovingBackward = inputY > DEADZONE;
			const rotationDirection = isMovingBackward ? 1 : -1;
			const turnDirection = inputX < 0 ? 1 : -1;

			if (inputX < 0) {
				onMovementChange('left', rotationAmount);
				onMovementChange('right', 0);
			} else {
				onMovementChange('right', rotationAmount);
				onMovementChange('left', 0);
			}

			movement.rotation.rotateDelta.x =
				turnDirection * rotationDirection * rotationAmount * 2 * movement.rotation.rotateSpeed;
		} else {
			onMovementChange('left', 0);
			onMovementChange('right', 0);
			movement.rotation.rotateDelta.x = 0;
		}
	}
</script>

<div
	class="touch-layer"
	onpointerdown={handlePointerStart}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerEnd}
	onpointercancel={handlePointerEnd}
>
	<!-- Joystick Visualization -->
	{#if activeTouchId !== null}
		<div class="joystick-base" style="left: {origin.x}px; top: {origin.y}px;"></div>
		<div
			class="joystick-knob"
			style="left: {origin.x + clampedPos.x}px; top: {origin.y + clampedPos.y}px;"
		></div>
	{/if}

	<!-- Action Buttons -->
	<ActionButtons {onMovementChange} />
</div>

<style>
	/* --- Layout & Touch Layer --- */
	.touch-layer {
		position: fixed;
		top: auto;
		left: 0;
		right: auto;
		bottom: 0;
		width: 40%;
		height: 40%;
		z-index: 10; /* Lower than UI but higher than canvas? No, keep as is */
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		background-color: transparent;
		font-family: var(--font-family);
	}

	/* --- Joystick --- */
	.joystick-base {
		position: absolute;
		width: 110px;
		height: 110px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(2px);
		transform: translate(-50%, -50%);
		pointer-events: none;
		box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
	}

	.joystick-knob {
		position: absolute;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.4);
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
		transform: translate(-50%, -50%);
		pointer-events: none;
	}
</style>
