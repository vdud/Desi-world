<!--
Auto-generated by: https://github.com/threlte/threlte/tree/main/packages/gltf
Command: npx @threlte/gltf@2.0.1 /Users/varundudeja/Documents/desi-world/static/models/desi-world/CasinoBuilding.glb --transform
-->

<script>
	import { Group } from 'three';
	import { T, forwardEventHandlers } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import { AutoColliders } from '@threlte/rapier';

	export const ref = new Group();

	const gltf = useGltf('/models/desi-world/CasinoBuilding-transformed.glb', { useDraco: true });

	const component = forwardEventHandlers();
</script>

<T is={ref} dispose={false} {...$$restProps} bind:this={$component}>
	{#await gltf}
		<slot name="fallback" />
	{:then gltf}
		<AutoColliders shape={'trimesh'}>
			<T.Mesh
				geometry={gltf.nodes.Casino.geometry}
				material={gltf.materials.Grey}
				position={[-0.02, 0, -32.74]}
			/>
		</AutoColliders>
	{:catch error}
		<slot name="error" {error} />
	{/await}

	<slot {ref} />
</T>
