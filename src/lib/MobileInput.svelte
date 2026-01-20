<!-- lib/MobileInput.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ControllerConfig } from './controllers/ControllerConfig';

	const dispatch = createEventDispatcher();

	let touchStart: { x: number; y: number } | null = null;
	let joystick = { x: 0, y: 0 };

	function onTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		}
	}

	function onTouchMove(e: TouchEvent) {
		if (!touchStart) return;
		e.preventDefault();

		const dx = e.touches[0].clientX - touchStart.x;
		const dy = e.touches[0].clientY - touchStart.y;
		const dist = Math.hypot(dx, dy);

		// Deadzone
		if (dist < 30) {
			joystick = { x: 0, y: 0 };
			return;
		}

		// Normalize with curve (ease-out feel)
		const curve = Math.min(dist / 100, 1);
		joystick = {
			x: (dx / dist) * curve,
			y: (dy / dist) * curve
		};
	}

	function onTouchEnd() {
		touchStart = null;
		joystick = { x: 0, y: 0 };
	}

	// Emit to InputManager
	$: dispatch('input', {
		x: joystick.x,
		z: -joystick.y, // Flip Y for natural up=forward
		run: false // Could add sprint button later
	});
</script>

<svelte:window on:touchstart={onTouchStart} on:touchmove={onTouchMove} on:touchend={onTouchEnd} />

<style>
	/* Visual joystick (hidden on desktop) */
	@media (max-width: 768px) {
		.joystick-zone {
			position: fixed;
			bottom: 2rem;
			left: 2rem;
			width: 150px;
			height: 150px;
			border: 2px solid rgba(255, 255, 255, 0.3);
			border-radius: 50%;
			touch-action: none;
		}
		.joystick-handle {
			position: absolute;
			width: 60px;
			height: 60px;
			background: rgba(255, 255, 255, 0.4);
			border-radius: 50%;
			transform: translate(-50%, -50%);
			left: 50%;
			top: 50%;
			transition: none;
		}
	}
</style>
