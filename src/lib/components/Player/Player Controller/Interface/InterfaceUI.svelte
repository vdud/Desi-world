<script lang="ts">
	import { type Vector2 } from 'three';

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

	// Direction state management with proper opposite direction cancellation
	function setDirectionState(
		direction: 'forward' | 'backward' | 'left' | 'right' | 'up',
		value: number
	) {
		// Clear opposite directions for exclusive movement
		if (direction === 'forward') onMovementChange('backward', 0);
		if (direction === 'backward') onMovementChange('forward', 0);
		if (direction === 'left') onMovementChange('right', 0);
		if (direction === 'right') onMovementChange('left', 0);

		// Set rotation for horizontal movement
		if (direction === 'left') {
			movement.rotation.rotateDelta.x = value ? -2 * movement.rotation.rotateSpeed : 0;
		}
		if (direction === 'right') {
			movement.rotation.rotateDelta.x = value ? 2 * movement.rotation.rotateSpeed : 0;
		}

		onMovementChange(direction, value);
	}

	// Handle button press with instant visual feedback
	function handlePress(direction: 'forward' | 'backward' | 'left' | 'right' | 'up') {
		setDirectionState(direction, 1);
	}

	// Handle button release with state cleanup
	function handleRelease(direction: 'forward' | 'backward' | 'left' | 'right' | 'up') {
		setDirectionState(direction, 0);
	}

	// Global release handler for pointer cancel events
	function handleGlobalPointerUp() {
		// Reset all movement states
		onMovementChange('forward', 0);
		onMovementChange('backward', 0);
		onMovementChange('left', 0);
		onMovementChange('right', 0);
		onMovementChange('up', 0);
		movement.rotation.rotateDelta.x = 0;
	}
</script>

<svelte:window on:pointerup={handleGlobalPointerUp} on:pointercancel={handleGlobalPointerUp} />

<div class="joystick-container" class:active={isInteracting}>
	<!-- Up/Forward -->
	<button
		class="dpad-btn up"
		on:pointerdown={() => handlePress('forward')}
		on:pointerup={() => handleRelease('forward')}
	>
		↑
	</button>

	<!-- Down/Backward -->
	<button
		class="dpad-btn down"
		on:pointerdown={() => handlePress('backward')}
		on:pointerup={() => handleRelease('backward')}
	>
		↓
	</button>

	<!-- Left -->
	<button
		class="dpad-btn left"
		on:pointerdown={() => handlePress('left')}
		on:pointerup={() => handleRelease('left')}
	>
		←
	</button>

	<!-- Right -->
	<button
		class="dpad-btn right"
		on:pointerdown={() => handlePress('right')}
		on:pointerup={() => handleRelease('right')}
	>
		→
	</button>

	<!-- Center/Jump -->
	<button
		class="dpad-btn center"
		on:pointerdown={() => handlePress('up')}
		on:pointerup={() => handleRelease('up')}
	>
		⚡
	</button>
</div>

<style>
	.joystick-container {
		/* Mobile-only visibility */
		display: none;

		/* Fixed positioning with safe margins */
		position: fixed;
		bottom: max(env(safe-area-inset-bottom, 20px), 20px);
		right: max(env(safe-area-inset-right, 20px), 20px);

		/* Sizing */
		width: 180px;
		height: 180px;

		/* Layering */
		z-index: 10000;

		/* Grid layout for D-pad */
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr;
		gap: 6px;

		/* Opacity transition for idle state */
		opacity: 0.25;
		transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);

		/* Touch optimization */
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
		-webkit-tap-highlight-color: transparent;
	}

	/* Active state - fully visible on interaction */
	.joystick-container.active {
		opacity: 0.95;
	}

	@media screen and (max-width: 768px) {
		.joystick-container {
			display: grid;
		}
	}

	.dpad-btn {
		/* Glassmorphism effect */
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);

		/* Border with subtle glow */
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;

		/* Typography */
		color: rgba(255, 255, 255, 0.9);
		font-size: 1.8rem;
		font-weight: 600;

		/* Flex centering */
		display: flex;
		align-items: center;
		justify-content: center;

		/* Interaction */
		cursor: pointer;
		transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1);

		/* Shadow */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

		/* Text selection prevention */
		user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	.dpad-btn:active {
		/* Active state - brighter with inset shadow */
		background: rgba(200, 220, 255, 0.25);
		transform: scale(0.92);
		box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	/* Grid positioning */
	.up {
		grid-column: 2;
		grid-row: 1;
	}
	.left {
		grid-column: 1;
		grid-row: 2;
	}
	.right {
		grid-column: 3;
		grid-row: 2;
	}
	.down {
		grid-column: 2;
		grid-row: 3;
	}
	.center {
		grid-column: 2;
		grid-row: 2;
		font-size: 1.4rem;
		background: rgba(255, 200, 100, 0.15);
	}
</style>
