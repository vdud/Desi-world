<script lang="ts">
	interface Props {
		onMovementChange: (direction: 'up', value: number) => void;
		onInteract?: () => void;
	}

	let { onMovementChange, onInteract }: Props = $props();

	function handleJump(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		onMovementChange('up', 1);
	}

	function handleJumpEnd(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		onMovementChange('up', 0);
	}

	function handleInteract(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		onInteract?.();
	}
</script>

<div class="action-buttons-container" onpointerdown={(e) => e.stopPropagation()}>
	<!-- Interact Button (Secondary) -->
	<button
		class="action-circle-btn secondary"
		onclick={handleInteract}
		ontouchstart={handleInteract}
		aria-label="Interact"
	>
		👋
	</button>

	<!-- Jump Button (Primary) -->
	<button
		class="action-circle-btn primary"
		onmousedown={handleJump}
		onmouseup={handleJumpEnd}
		onmouseleave={handleJumpEnd}
		ontouchstart={handleJump}
		ontouchend={handleJumpEnd}
		aria-label="Jump"
	>
		⚡
	</button>
</div>

<style>
	.action-buttons-container {
		position: fixed;
		bottom: max(env(safe-area-inset-bottom), 30px);
		right: max(env(safe-area-inset-right), 30px);
		display: flex;
		flex-direction: column-reverse; /* Stack upwards */
		align-items: center;
		gap: 20px;
		z-index: 101;
		pointer-events: none; /* Let container not block clicks, but children will */
	}

	.action-circle-btn {
		/* Shared base styles */
		border-radius: 50%;
		backdrop-filter: blur(10px);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		touch-action: none;
		pointer-events: auto;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	}

	/* Primary (Jump) */
	.action-circle-btn.primary {
		width: 70px;
		height: 70px;
		background: rgba(0, 0, 0, 0.5);
		font-size: 1.5rem;
		border-color: rgba(255, 255, 255, 0.2);
	}

	.action-circle-btn.primary:active {
		transform: scale(0.92);
		border-color: var(--terminal-accent);
		box-shadow: 0 0 20px rgba(74, 246, 38, 0.3);
		background: rgba(74, 246, 38, 0.1);
	}

	/* Secondary (Interact) */
	.action-circle-btn.secondary {
		width: 50px;
		height: 50px;
		background: rgba(0, 0, 0, 0.4);
		font-size: 1.2rem;
	}

	.action-circle-btn.secondary:active {
		transform: scale(0.9);
		border-color: #ffffff;
		background: rgba(255, 255, 255, 0.1);
	}

	/* Optional: Position secondary button diagonally */
	@media (min-width: 600px) {
		.action-buttons-container {
			flex-direction: row-reverse; /* Desktop: side-by-side */
			align-items: flex-end;
		}
	}
</style>
