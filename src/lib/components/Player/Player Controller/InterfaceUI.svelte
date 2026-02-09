<!-- src/lib/components/Player/Player Controller/InterfaceUI.svelte -->
<script lang="ts">
	import { type Vector2 } from 'three';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
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

	// --- Menu State ---
	let isMenuOpen = $state(false);

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
		// --- Lifecycle: Lock Scroll & Height for Game Mode ---
		const originalBodyOverflow = document.body.style.overflow;
		const originalDocOverflow = document.documentElement.style.overflow;
		const originalBodyHeight = document.body.style.height;
		const originalDocHeight = document.documentElement.style.height;

		document.body.style.overflow = 'hidden';
		document.documentElement.style.overflow = 'hidden';
		document.body.style.height = '100dvh';
		document.documentElement.style.height = '100dvh';

		// --- Lifecycle: Fullscreen Listeners ---
		const handleFullscreenChange = () => {
			isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

		return () => {
			// Restore Styles
			document.body.style.overflow = originalBodyOverflow;
			document.documentElement.style.overflow = originalDocOverflow;
			document.body.style.height = originalBodyHeight;
			document.documentElement.style.height = originalDocHeight;

			// Remove Listeners
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
	<!-- Menu Hamburger Button (Top Right) -->
	<button
		class="icon-btn menu-btn"
		onclick={() => (isMenuOpen = !isMenuOpen)}
		onpointerdown={(e) => e.stopPropagation()}
		aria-label="Toggle Menu"
	>
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M3 12h18M3 6h18M3 18h18" />
		</svg>
	</button>

	<!-- Menu Overlay -->
	{#if isMenuOpen}
		<div
			class="menu-backdrop"
			transition:fade={{ duration: 200 }}
			onclick={() => (isMenuOpen = false)}
			onpointerdown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<!-- Menu Container -->
			<!-- stopPropagation on click prevents closing when clicking logic inside content -->
			<div
				class="menu-container"
				transition:fly={{ y: -20, duration: 300 }}
				onclick={(e) => e.stopPropagation()}
			>
				<div class="menu-header">
					<h3>Menu</h3>
					<!-- Mobile Close Button -->
					<button class="close-btn" onclick={() => (isMenuOpen = false)} aria-label="Close Menu">
						✕
					</button>
				</div>

				<div class="menu-grid">
					<!-- Marketplace Link -->
					<a href="/marketplace" class="menu-item link">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="currentColor"
							class="bi bi-shop-window"
							viewBox="0 0 16 16"
						>
							<path
								d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5m2 .5a.5.5 0 0 1 .5.5V13h8V9.5a.5.5 0 0 1 1 0V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a.5.5 0 0 1 .5-.5"
							/>
						</svg>
						<span class="label">Marketplace</span>
					</a>

					<!-- Fullscreen Toggle -->
					<button class="menu-item action-btn" onclick={toggleFullscreen}>
						<span class="icon">
							{#if isFullscreen}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1"
									><path
										d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
									/></svg
								>
							{:else}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg
								>
							{/if}
						</span>
						<span class="label">{isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}</span>
					</button>

					<!-- Wallet Connect -->
					<div class="menu-item wallet-wrapper">
						<ConnectWallet />
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Joystick Visualization -->
	{#if activeTouchId !== null}
		<div class="joystick-base" style="left: {origin.x}px; top: {origin.y}px;"></div>
		<div
			class="joystick-knob"
			style="left: {origin.x + clampedPos.x}px; top: {origin.y + clampedPos.y}px;"
		></div>
	{/if}

	<!-- Jump Button (Bottom Right) -->
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

	/* --- Buttons --- */
	.icon-btn {
		position: fixed;
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
		z-index: 102; /* Higher than touch layer */
	}

	.icon-btn:active {
		transform: scale(0.9);
		background: rgba(255, 255, 255, 0.3);
	}

	.menu-btn {
		top: max(env(safe-area-inset-top), 20px);
		right: max(env(safe-area-inset-right), 20px);
	}

	/* --- Menu Overlay --- */
	.menu-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.2);
		z-index: 103;
		display: flex;
		justify-content: flex-end;
		align-items: flex-start;
		padding: max(env(safe-area-inset-top), 20px) max(env(safe-area-inset-right), 20px);
		pointer-events: auto;
	}

	.menu-container {
		width: 280px;
		background: rgba(10, 10, 12, 0.85);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 20px;
		padding: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 50px; /* Offset to not cover the menu button immediately if we wanted animation, though we are replacing it visually in flow usually. But here we overlay. */
	}

	/* Adjustment: Position menu relative to button or screen */
	.menu-container {
		margin-top: 50px; /* Space for the button row if needed, or just offset */
	}

	.menu-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.menu-header h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #fff;
		font-family: inherit;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		font-size: 1.2rem;
		cursor: pointer;
		padding: 4px;
		line-height: 1;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #fff;
	}

	.menu-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.9);
		text-decoration: none;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.menu-item:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
	}

	.menu-item:active {
		transform: scale(0.98);
	}

	.menu-item.action-btn {
		appearance: none;
		width: 100%;
		text-align: left;
	}

	.menu-item .icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}
	.menu-item .icon svg {
		width: 20px;
		height: 20px;
	}

	.wallet-wrapper {
		background: transparent;
		border: none;
		padding: 0;
		justify-content: center;
		/* Reset hover effects for wallet container as it handles its own */
		pointer-events: auto;
	}
	.wallet-wrapper:hover {
		background: transparent;
		transform: none;
	}

	/* --- Joystick & Jump --- */

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
		z-index: 101;
	}

	.jump-btn:active {
		transform: scale(0.9);
		background: rgba(255, 200, 100, 0.4);
	}
</style>
