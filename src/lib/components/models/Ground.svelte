<!-- src/lib/components/models/Ground.svelte -->
<script lang="ts">
	import { T } from '@threlte/core';
	import { useDraco, useGltf } from '@threlte/extras';
	import { AutoColliders } from '@threlte/rapier';
	import { isPlane } from '$lib/stores/commonStores';
	import type { RenderProps } from './render-props';

	let { fallback, error, children, ref = $bindable(), ...props }: RenderProps = $props();

	const dracoLoader = useDraco();

	// Aggressive cleanup for memory
	const gltf = useGltf('/models/world-assets/Ground-transformed.glb', {
		dracoLoader,
		autoDispose: true
	});

	// Set ready state immediately when geometry is available
	gltf
		.then((data) => {
			if (data?.nodes?.Ground) {
				$isPlane = true;
			}
		})
		.catch((err) => {
			console.error('Failed to load ground:', err);
		});
</script>

<T.Group bind:ref dispose={false} {...props}>
	{#await gltf}
		{@render fallback?.()}
		<!-- Simple fallback plane while loading -->
		<T.Mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
			<T.PlaneGeometry args={[100, 100]} />
			<T.MeshBasicMaterial color={0x333333} />
		</T.Mesh>
	{:then gltf}
		<AutoColliders shape="cuboid">
			<T.Mesh
				geometry={gltf.nodes.Ground.geometry}
				material={gltf.nodes.Ground.material}
				receiveShadow
				frustumCulled={true}
			/>
		</AutoColliders>
	{:catch err}
		{@render error?.({ error: err })}
		<!-- Emergency fallback on error -->
		<AutoColliders shape="cuboid">
			<T.Mesh position={[0, 0, 0]}>
				<T.BoxGeometry args={[100, 1, 100]} />
				<T.MeshStandardMaterial color={0x666666} />
			</T.Mesh>
		</AutoColliders>
	{/await}

	{@render children?.({ ref })}
</T.Group>
