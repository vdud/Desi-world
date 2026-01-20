<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { World } from '@threlte/rapier';
	import Scene from './Scene.svelte';
	import InterfaceUi from './InterfaceUI.svelte';
	import ThirdPersonController from '$lib/ThirdPersonController.svelte';
</script>

<!-- <Canvas>
	<World>
		<Scene />
	</World>
</Canvas> -->

<!-- All Buttons -->
<InterfaceUi />

<Canvas>
	<World>
		<Scene />
		<ThirdPersonController position={[0, 2, 0]} />
	</World>
</Canvas>
