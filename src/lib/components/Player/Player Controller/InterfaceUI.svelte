<script lang="ts">
	import { type Vector2, Vector3, Quaternion, Euler } from 'three';
	import { onMount } from 'svelte';
	import {
		playerPosition,
		playerRotation,
		navigationTarget,
		playerName
	} from '$lib/stores/commonStores.ts';

	// Import new UI components
	import TopActionBar from './Interface UI Components/TopActionBar.svelte';
	import SettingsMenu from './Interface UI Components/SettingsMenu.svelte';
	import MarketplaceModal from './Interface UI Components/MarketplaceModal.svelte';
	import Joystick from './Interface UI Components/Joystick.svelte';
	import ChatInterface from './Interface UI Components/ChatInterface.svelte';
	import { isChatOpen } from '$lib/stores/commonStores';

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

	// --- Navigation State ---
	let navAngle = $state(0);
	let navDistance = $state(0);
	let showNavArrow = $state(false);

	$effect(() => {
		if ($navigationTarget && $playerPosition) {
			const target = new Vector3($navigationTarget.x, $navigationTarget.y, $navigationTarget.z);
			const playerPos = $playerPosition;

			// Calculate distance
			navDistance = Math.round(playerPos.distanceTo(target));

			// Calculate angle relative to camera/player forward
			// This is tricky because "Forward" depends on camera rotation usually,
			// but here we might just want world calibration or relative to player rotation.
			// Let's try relative to player rotation first.

			const dx = target.x - playerPos.x;
			const dz = target.z - playerPos.z;

			// Angle to target in world space (radians)
			// Math.atan2(z, x) usually, but check coordinate system. Three.js is -Z forward?
			// Let's just use standard trig and adjust offset.
			let targetAngle = Math.atan2(dx, dz); // 0 is +Z?

			// Player Y rotation
			const playerYRot = $playerRotation.y;

			// Relative angle
			// We want the arrow to point relative to "Up" on screen being "Forward" for player.
			// So if Target is directly in front, angle should be 0.

			navAngle = targetAngle - playerYRot;
			showNavArrow = true;

			// Auto clear if close
			if (navDistance < 2) {
				navigationTarget.set(null);
				showNavArrow = false;
			}
		} else {
			showNavArrow = false;
		}
	});

	function clearNavigation() {
		navigationTarget.set(null);
	}

	// --- UI State ---
	let isFullscreen = $state(false);
	let isMenuOpen = $state(false);
	let showMarket = $state(false);

	// 	onMount(() => {
	// 		const originalBodyOverflow = document.body.style.overflow;
	// 		const originalDocOverflow = document.documentElement.style.overflow;
	// 		const originalBodyHeight = document.body.style.height;
	// 		const originalDocHeight = document.documentElement.style.height;

	// 		document.body.style.overflow = 'hidden';
	// 		document.documentElement.style.overflow = 'hidden';
	// 		document.body.style.height = '100dvh';
	// 		document.documentElement.style.height = '100dvh';

	// 		const handleFullscreenChange = () => {
	// 			isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
	// 		};

	// 		document.addEventListener('fullscreenchange', handleFullscreenChange);
	// 		document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

	// 		return () => {
	// 			document.body.style.overflow = originalBodyOverflow;
	// 			document.documentElement.style.overflow = originalDocOverflow;
	// 			document.body.style.height = originalBodyHeight;
	// 			document.documentElement.style.height = originalDocHeight;

	// 			document.removeEventListener('fullscreenchange', handleFullscreenChange);
	// 			document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
	// 		};
	// 	});
	//
</script>

<!-- Top Right Action Bar -->
<TopActionBar bind:showMarket bind:isMenuOpen />

<!-- Settings Menu Overlay -->
<SettingsMenu bind:isMenuOpen {isFullscreen} />
<div
	class="username-display"
	style="position: fixed; top: 10px; left: 10px; z-index: 50; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 8px; color: white;"
>
	<input
		type="text"
		bind:value={$playerName}
		placeholder="Enter Name"
		style="background: transparent; border: none; color: white; font-family: monospace; font-size: 1rem; width: 120px; z-index: 100;"
		onkeydown={(e) => e.stopPropagation()}
	/>
</div>

<!-- Main Marketplace Modal -->
<MarketplaceModal bind:showMarket />

{#if $isChatOpen}
	<ChatInterface />
{/if}

<!-- Joystick Visualization & Action Buttons -->
<Joystick {movement} {onMovementChange} />

<!-- Navigation Arrow Overlay -->
{#if showNavArrow}
	<div class="nav-overlay">
		<div class="nav-arrow" style="transform: rotate({navAngle}rad);">➤</div>
		<div class="nav-info">
			<span>{navDistance}m</span>
			<button class="nav-stop" onclick={clearNavigation}>×</button>
		</div>
	</div>
{/if}

<style>
	.nav-overlay {
		position: fixed;
		top: 100px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
		pointer-events: none; /* Let clicks pass through except button */
		z-index: 50;
	}

	.nav-arrow {
		font-size: 3rem;
		color: #f1c40f;
		text-shadow: 0 0 10px #f1c40f;
		transition: transform 0.1s linear;
	}

	.nav-info {
		background: rgba(0, 0, 0, 0.6);
		padding: 4px 12px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		gap: 8px;
		pointer-events: auto;
	}

	.nav-info span {
		color: #fff;
		font-family: monospace;
		font-weight: bold;
	}

	.nav-stop {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: #fff;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1rem;
		padding: 0;
	}
</style>
