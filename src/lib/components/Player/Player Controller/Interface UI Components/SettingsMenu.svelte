<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	interface Props {
		isMenuOpen: boolean;
		isFullscreen: boolean;
	}

	let { isMenuOpen = $bindable(), isFullscreen }: Props = $props();

	function toggleFullscreen() {
		const docEl = document.documentElement;

		requestAnimationFrame(() => {
			if (!document.fullscreenElement && !(docEl as any).webkitFullscreenElement) {
				if (docEl.requestFullscreen) {
					docEl
						.requestFullscreen()
						.catch((err: unknown) => console.error('Standard FS error:', err));
				} else if ((docEl as any).webkitRequestFullscreen) {
					(docEl as any)
						.webkitRequestFullscreen()
						.catch((err: unknown) => console.error('Webkit FS error:', err));
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
</script>

<!-- Settings Menu Overlay -->
{#if isMenuOpen}
	<div
		class="menu-backdrop"
		transition:fade={{ duration: 200 }}
		onclick={() => (isMenuOpen = false)}
		onpointerdown={(e) => e.stopPropagation()}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="menu-container"
			transition:fly={{ y: -20, duration: 300 }}
			onclick={(e) => e.stopPropagation()}
		>
			<div class="menu-header">
				<h3>System</h3>
				<button class="close-btn" onclick={() => (isMenuOpen = false)} aria-label="Close Menu">
					✕
				</button>
			</div>

			<div class="menu-grid">
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
			</div>
		</div>
	</div>
{/if}

<style>
	/* --- Menu Overlay (Settings) --- */
	.menu-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		z-index: 200; /* High z-index */
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: auto;
	}

	.menu-container {
		width: 300px;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
	}

	.menu-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border-color);
		margin-bottom: 16px;
	}

	.menu-header h3 {
		font-size: 1rem;
		color: var(--terminal-accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-family: var(--font-mono);
	}

	.close-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-size: 1.2rem;
		cursor: pointer;
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
		padding: 14px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid transparent;
		color: var(--text-primary);
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.menu-item:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: var(--border-color);
	}
</style>
