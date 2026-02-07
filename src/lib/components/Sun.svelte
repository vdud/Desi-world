<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { playerPosition } from '$lib/stores/commonStores';
	import { get } from 'svelte/store';
	import { Group, DirectionalLight, Vector3 } from 'three';

	let light = $state<DirectionalLight>();
	let target = $state<Group>();

	useTask(() => {
		const pos = get(playerPosition);
		if (light && target) {
			// Calculate desired positions
			const lightX = pos.x + 50;
			const lightY = pos.y + 80;
			const lightZ = pos.z + 50;

			// Texel Snapping Logic to prevent "shimmering"
			// 1. Calculate world units per texel
			// MapSize = 4096, FrustumWidth = 80 (-40 to 40)
			// TexelSize = 80 / 4096 = ~0.0195 units
			const frustumSize = 80;
			const mapSize = 4096;
			const texelSize = frustumSize / mapSize;

			// 2. Snap position to nearest texel multiple
			light.position.set(
				Math.floor(lightX / texelSize) * texelSize,
				lightY, // Y doesn't need strict snapping for top-down lights usually, but consistency helps
				Math.floor(lightZ / texelSize) * texelSize
			);

			// Target must also snap or be relative to the snapped light
			target.position.set(
				Math.floor(pos.x / texelSize) * texelSize,
				pos.y,
				Math.floor(pos.z / texelSize) * texelSize
			);

			light.updateMatrixWorld();
			target.updateMatrixWorld();
		}
	});
</script>

<T.Group>
	<!-- Target Object that the light points at -->
	<T.Group bind:ref={target} />

	<!-- High Resolution PCFSoft Shadow Setup -->
	<T.DirectionalLight
		bind:ref={light}
		{target}
		intensity={2}
		castShadow
		shadow.mapSize={[4096, 4096]}
		shadow.bias={-0.0005}
		shadow.normalBias={0.04}
		shadow.camera.near={10}
		shadow.camera.far={200}
		shadow.camera.left={-40}
		shadow.camera.right={40}
		shadow.camera.top={40}
		shadow.camera.bottom={-40}
	/>
</T.Group>
