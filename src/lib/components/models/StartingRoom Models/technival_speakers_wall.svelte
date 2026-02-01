<script lang="ts">
	import { T } from '@threlte/core';
	import { useDraco, useGltf } from '@threlte/extras';
	import { AutoColliders } from '@threlte/rapier';
	import { playerPosition } from '$lib/stores/commonStores';
	import { Vector3 } from 'three';
	import { onMount } from 'svelte';

	let { fallback, error, children, ref = $bindable(), ...props } = $props();

	const dracoLoader = useDraco();
	const gltf = useGltf('models/world-assets/technival_speakers_wall-transformed.glb', {
		dracoLoader
	});

	// Speaker position (world coordinates) - adjusted to center of speaker wall
	const SPEAKER_POS = new Vector3(-10, 2.5, -5);

	// Audio zones
	const MAX_DISTANCE = 13; // Completely silent beyond this
	const FULL_VOLUME_DIST = 3; // 100% volume within this distance
	const FALLOFF_START = 10; // Begin noticeable falloff here

	// Smoothing config (in seconds)
	const ATTACK_TIME = 0.3; // Time to reach target when getting louder
	const RELEASE_TIME = 1.2; // Time to reach target when getting quieter (slower fade out)

	const songs = [
		'/speaker-songs/track-1-breadgang-like-a-bird.opus'
		// Add more songs here:
		// '/speaker-songs/track2.opus',
	];

	// Audio state
	let audio: HTMLAudioElement;
	let audioContext: AudioContext;
	let gainNode: GainNode;
	let isAudioStarted = $state(false);
	let currentGain = 0;
	let targetGain = 0;
	let lastUpdateTime = 0;

	// Easing functions
	function easeOutExpo(x: number): number {
		return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
	}

	function easeInOutCubic(x: number): number {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	}

	function smoothstep(min: number, max: number, value: number): number {
		const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
		return x * x * (3 - 2 * x);
	}

	// Logarithmic volume mapping (perceptual loudness)
	// Maps 0-1 to proper dB scale (-60dB to 0dB) then back to linear gain
	function perceptualVolume(normalizedDist: number): number {
		// Invert distance (0 = far, 1 = close)
		const closeness = 1 - normalizedDist;

		// Exponential curve: quiet when far, rapid increase when close
		// Power of 2.5 creates natural "arrival" feeling
		const curved = Math.pow(closeness, 2.5);

		// Smoothstep for extra buttery transition at the edges
		return easeOutExpo(curved);
	}

	export function initAudio() {
		if (isAudioStarted) return;

		audio = new Audio(songs[0]);
		audio.loop = songs.length === 1;
		audio.crossOrigin = 'anonymous';

		audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		const source = audioContext.createMediaElementSource(audio);
		gainNode = audioContext.createGain();

		source.connect(gainNode);
		gainNode.connect(audioContext.destination);

		// Initialize at silence
		gainNode.gain.value = 0;
		currentGain = 0;
		targetGain = 0;

		audio.play().catch((e) => console.log('Waiting for user interaction...'));

		audio.addEventListener('ended', () => {
			if (songs.length > 1) {
				// Cycle to next song
				const nextIndex = (songs.indexOf(audio.src.split('/').pop() || '') + 1) % songs.length;
				audio.src = songs[nextIndex];
				audio.play();
			}
		});

		isAudioStarted = true;
	}

	// Smooth interpolation with different attack/release times
	function smoothGain(current: number, target: number, deltaTime: number): number {
		const isRising = target > current;
		const timeConstant = isRising ? ATTACK_TIME : RELEASE_TIME;

		// Exponential smoothing: closer we get to target, slower we move (natural decay)
		const alpha = 1 - Math.exp(-deltaTime / timeConstant);
		return current + (target - current) * alpha;
	}

	// Main proximity loop with high-precision timing
	function updateVolume(timestamp: number) {
		if (!isAudioStarted || !gainNode) return;

		const deltaTime = (timestamp - lastUpdateTime) / 1000;
		lastUpdateTime = timestamp;

		if (deltaTime > 0 && deltaTime < 0.1) {
			// Sanity check
			// Calculate target based on distance
			const pos = $playerPosition;
			const distance = pos.distanceTo(SPEAKER_POS);

			let rawTarget = 0;

			if (distance <= FULL_VOLUME_DIST) {
				rawTarget = 1.0;
			} else if (distance >= MAX_DISTANCE) {
				rawTarget = 0.0;
			} else {
				// Smooth gradient between full volume and silence
				const t = (distance - FULL_VOLUME_DIST) / (MAX_DISTANCE - FULL_VOLUME_DIST);
				rawTarget = perceptualVolume(t);
			}

			targetGain = rawTarget;

			// Smooth the transition (temporal smoothing)
			currentGain = smoothGain(currentGain, targetGain, deltaTime);

			// Apply to audio node (small threshold to prevent floating point noise)
			if (Math.abs(currentGain - gainNode.gain.value) > 0.001) {
				gainNode.gain.value = currentGain;
			}
		}

		requestAnimationFrame(updateVolume);
	}

	$effect(() => {
		if (isAudioStarted && lastUpdateTime === 0) {
			lastUpdateTime = performance.now();
			requestAnimationFrame(updateVolume);
		}
	});

	onMount(() => {
		const handleInteraction = () => {
			if (!isAudioStarted) initAudio();
			if (audioContext?.state === 'suspended') audioContext.resume();
		};

		window.addEventListener('click', handleInteraction, { once: true });
		window.addEventListener('keydown', handleInteraction, { once: true });

		return () => {
			window.removeEventListener('click', handleInteraction);
			window.removeEventListener('keydown', handleInteraction);
			if (audio) {
				audio.pause();
				audio.src = '';
			}
			if (audioContext) audioContext.close();
		};
	});
</script>

{#if !isAudioStarted}
	<div
		style="position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); 
              background: rgba(0,0,0,0.8); color: white; padding: 12px 24px; 
              border-radius: 8px; z-index: 1000; font-family: system-ui, sans-serif; 
              font-size: 14px; pointer-events: none; border: 1px solid rgba(255,255,255,0.2);"
	>
		🔊 Click to enable speaker audio
	</div>
{/if}

<!-- Visual debug (optional) -->
{#if isAudioStarted && currentGain > 0.01}
	<div
		style="position: fixed; bottom: 30px; right: 30px; 
              background: rgba(0,0,0,0.7); padding: 12px; border-radius: 8px; 
              z-index: 999; font-family: monospace; font-size: 11px; color: #0f0;"
	>
		<div>♪ {Math.round(currentGain * 100)}%</div>
		<div style="width: 100px; height: 4px; background: #333; margin-top: 4px; border-radius: 2px;">
			<div
				style="width: {currentGain * 100}%; height: 100%; background: #0f0; 
                  border-radius: 2px; transition: width 0.1s;"
			></div>
		</div>
	</div>
{/if}

<T.Group bind:ref dispose={false} {...props}>
	{#await gltf}
		{@render fallback?.()}
	{:then gltf}
		<T.Group position={[-10, 0, -5]} rotation={[0, Math.PI / 2, 0]} scale={0.5}>
			<AutoColliders shape="convexHull">
				<T.Group position={[4.02, 5.16, -7.65]} scale={0.15}>
					<T.Mesh geometry={gltf.nodes.Object_8.geometry} material={gltf.materials.material_0} />
					<T.Mesh geometry={gltf.nodes.Object_9.geometry} material={gltf.materials.material_0} />
				</T.Group>
				<T.Group position={[10.55, 2.04, 9.04]} rotation={[Math.PI, -1.36, Math.PI]} scale={0.22}>
					<T.Mesh geometry={gltf.nodes.Object_13.geometry} material={gltf.materials.material_0} />
					<T.Mesh geometry={gltf.nodes.Object_14.geometry} material={gltf.materials.material_0} />
					<T.Mesh geometry={gltf.nodes.Object_15.geometry} material={gltf.materials.material_0} />
					<T.Mesh geometry={gltf.nodes.Object_16.geometry} material={gltf.materials.material_0} />
				</T.Group>
				<T.Mesh
					geometry={gltf.nodes.Object_4.geometry}
					material={gltf.materials.material_0}
					position={[3.18, 2.1, -12.89]}
					rotation={[0, -0.01, 0]}
					scale={0.22}
				/>
				<T.Mesh
					geometry={gltf.nodes.Object_6.geometry}
					material={gltf.materials.material_0}
					position={[-1.42, 1.4, -17.07]}
					scale={0.26}
				/>
				<T.Mesh
					geometry={gltf.nodes.Object_11.geometry}
					material={gltf.materials.material_0}
					position={[-2.5, 2.24, 5.38]}
					scale={0.17}
				/>
				<T.Mesh
					geometry={gltf.nodes.Object_18.geometry}
					material={gltf.materials.material_0}
					position={[8.36, -0.17, 4.63]}
					scale={0.15}
				/>
				<T.Mesh
					geometry={gltf.nodes.Object_20.geometry}
					material={gltf.materials.material_0}
					position={[6.06, 3.19, 1.77]}
					scale={1.8}
				/>
				<T.Mesh
					geometry={gltf.nodes.Object_22.geometry}
					material={gltf.materials.material_0}
					position={[4.4, 1.05, 1.43]}
					scale={1.38}
				/>
				<T.Mesh
					geometry={gltf.nodes.Object_24.geometry}
					material={gltf.materials.material_0}
					position={[2.89, 2.35, 8.17]}
					rotation={[0, 0.46, 0]}
					scale={0.19}
				/>
				<T.Mesh
					geometry={gltf.nodes.Object_26.geometry}
					material={gltf.materials.material_0}
					position={[2, 4.51, -6.18]}
					scale={0.15}
				/>
			</AutoColliders>
		</T.Group>
	{:catch err}
		{@render error?.({ error: err })}
	{/await}
	{@render children?.({ ref })}
</T.Group>
