<!-- src/lib/components/Player/Player Controller/InterfaceUI.svelte -->
<script lang="ts">
	import { type Vector2 } from 'three';
	import { onMount } from 'svelte';
	import ConnectWallet from '$lib/components/ui/ConnectWallet.svelte';

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
		isInteracting: boolean;
	}

	let { movement, onMovementChange, isInteracting }: Props = $props();

	// --- Joystick State ---
	const MAX_RADIUS = 50;

	// Active deadzone values (using percentage 0-1 instead of pixels)
	const DEADZONE = 0.15; // 15% - general movement deadzone
	const ROTATION_DEADZONE = 0.25; // 25% - wider deadzone for rotation to help go straight

	let activeTouchId: number | null = $state(null);
	let origin = $state({ x: 0, y: 0 });
	let current = $state({ x: 0, y: 0 });
	let clampedPos = $state({ x: 0, y: 0 });

	// --- Fullscreen State ---
	let isFullscreen = $state(false);

	// --- Handlers ---

	function handlePointerStart(e: PointerEvent) {
		if (e.button !== 0) return;
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

		// Reset State
		onMovementChange('forward', 0);
		onMovementChange('backward', 0);
		onMovementChange('left', 0);
		onMovementChange('right', 0);
		movement.rotation.rotateDelta.x = 0;
	}

	// --- Fullscreen Logic (Robust for iOS) ---

	function toggleFullscreen() {
		const docEl = document.documentElement;

		requestAnimationFrame(() => {
			if (!document.fullscreenElement && !(docEl as any).webkitFullscreenElement) {
				if (docEl.requestFullscreen) {
					docEl.requestFullscreen().catch((err) => console.error('Standard FS error:', err));
				} else if ((docEl as any).webkitRequestFullscreen) {
					(docEl as any)
						.webkitRequestFullscreen()
						.catch((err) => console.error('Webkit FS error:', err));
				}
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if ((document as any).webkitExitFullscreen) {
					(document as any).webkitExitFullscreen();
				}
			}
		});
	}

	onMount(() => {
		const handleFullscreenChange = () => {
			isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
		};
	});

	// --- Joystick Math (DYNAMIC/ANALOG) ---

	function updateMovementState() {
		const dx = current.x - origin.x;
		const dy = current.y - origin.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Visual Clamping
		let visualX = dx;
		let visualY = dy;
		if (distance > MAX_RADIUS) {
			const ratio = MAX_RADIUS / distance;
			visualX = dx * ratio;
			visualY = dy * ratio;
		}
		clampedPos = { x: visualX, y: visualY };

		const inputX = visualX / MAX_RADIUS; // -1 to 1 (left to right)
		const inputY = visualY / MAX_RADIUS; // -1 to 1 (up to down)

		// General deadzone - ignore tiny movements
		if (Math.abs(inputX) < DEADZONE && Math.abs(inputY) < DEADZONE) {
			onMovementChange('forward', 0);
			onMovementChange('backward', 0);
			onMovementChange('left', 0);
			onMovementChange('right', 0);
			movement.rotation.rotateDelta.x = 0;
			return;
		}

		// --- DYNAMIC MOVEMENT (0-1 range based on joystick distance) ---
		const moveAmount = Math.min(Math.abs(inputY) / (1 - DEADZONE), 1); // Normalize 0-1

		if (inputY < -DEADZONE) {
			// Forward with analog intensity (gentle push = slow walk, full push = run)
			onMovementChange('forward', moveAmount);
			onMovementChange('backward', 0);
		} else if (inputY > DEADZONE) {
			// Backward with analog intensity
			onMovementChange('backward', moveAmount);
			onMovementChange('forward', 0);
		} else {
			// Near center Y - no forward/back movement
			onMovementChange('forward', 0);
			onMovementChange('backward', 0);
		}

		// --- DYNAMIC ROTATION (only when horizontal input exceeds deadzone) ---
		if (Math.abs(inputX) > ROTATION_DEADZONE) {
			// Calculate rotation intensity 0-1 based on how far past deadzone
			const rotationAmount = (Math.abs(inputX) - ROTATION_DEADZONE) / (1 - ROTATION_DEADZONE);

			// Reverse steering when going backward (car-like controls)
			const isMovingBackward = inputY > DEADZONE;
			const rotationDirection = isMovingBackward ? 1 : -1;
			const turnDirection = inputX < 0 ? 1 : -1; // Left = positive, Right = negative

			// Send analog values (0-1) for left/right
			if (inputX < 0) {
				onMovementChange('left', rotationAmount);
				onMovementChange('right', 0);
			} else {
				onMovementChange('right', rotationAmount);
				onMovementChange('left', 0);
			}

			// Scale rotation by intensity: small drift = slow turn, full push = fast turn
			movement.rotation.rotateDelta.x =
				turnDirection * rotationDirection * rotationAmount * 2 * movement.rotation.rotateSpeed;
		} else {
			// Within horizontal deadzone - GO STRAIGHT, no rotation
			onMovementChange('left', 0);
			onMovementChange('right', 0);
			movement.rotation.rotateDelta.x = 0;
		}
	}

	function handleJump(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		onMovementChange('up', 1);
	}

	function handleJumpEnd(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		onMovementChange('up', 0);
	}
</script>

<div
	class="touch-layer"
	class:active={isInteracting}
	onpointerdown={handlePointerStart}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerEnd}
	onpointercancel={handlePointerEnd}
>
	<!-- Connect Wallet (Top Left) -->
	<div class="wallet-container" onpointerdown={(e) => e.stopPropagation()}>
		<ConnectWallet />
	</div>

	<!-- Fullscreen Toggle Button -->
	<button
		class="icon-btn fullscreen-btn"
		onclick={toggleFullscreen}
		style="touch-action: manipulation;"
		aria-label="Toggle Fullscreen"
	>
		{#if isFullscreen}
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
				/>
			</svg>
		{:else}
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
			</svg>
		{/if}
	</button>

	{#if activeTouchId !== null}
		<div class="joystick-base" style="left: {origin.x}px; top: {origin.y}px;"></div>
		<div
			class="joystick-knob"
			style="left: {origin.x + clampedPos.x}px; top: {origin.y + clampedPos.y}px;"
		></div>
	{/if}

	<!-- Jump Button -->
	<button
		class="jump-btn"
		onmousedown={handleJump}
		onmouseup={handleJumpEnd}
		onmouseleave={handleJumpEnd}
		ontouchstart={handleJump}
		ontouchend={handleJumpEnd}
	>
		⚡
	</button>
</div>

<style>
	.wallet-container {
		position: fixed;
		top: max(env(safe-area-inset-top), 20px);
		left: max(env(safe-area-inset-left), 20px);
		z-index: 101;
	}

	:global(html, body) {
		height: 100dvh;
		overflow: hidden;
	}

	.touch-layer {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 100;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		background-color: transparent;
	}

	.icon-btn {
		position: fixed;
		top: max(env(safe-area-inset-top), 20px);
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.1s;
		z-index: 101;
	}

	.icon-btn:active {
		transform: scale(0.9);
		background: rgba(255, 255, 255, 0.2);
	}

	.fullscreen-btn {
		right: max(env(safe-area-inset-right), 20px);
	}

	.joystick-base {
		position: absolute;
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(2px);
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.joystick-knob {
		position: absolute;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.5);
		box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.jump-btn {
		position: fixed;
		bottom: max(env(safe-area-inset-bottom), 30px);
		right: max(env(safe-area-inset-right), 30px);
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background: rgba(255, 200, 100, 0.15);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 200, 100, 0.3);
		color: rgba(255, 255, 255, 0.9);
		font-size: 1.5rem;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			transform 0.1s,
			background 0.1s;
		touch-action: none;
	}

	.jump-btn:active {
		transform: scale(0.9);
		background: rgba(255, 200, 100, 0.4);
	}
</style>
