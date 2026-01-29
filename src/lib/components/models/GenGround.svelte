<script>
	import { T } from '@threlte/core';
	import { AutoColliders } from '@threlte/rapier';

	const size = 10; // 3x3 grid
	const tileSize = 5;
	const gap = 0.1;
	const y = -0.05;

	const step = tileSize + gap;
	const offset = ((size - 1) * step) / 2;

	const positions = [];

	for (let x = 0; x < size; x++) {
		for (let z = 0; z < size; z++) {
			positions.push([x * step - offset, y, z * step - offset]);
		}
	}
</script>

{#each positions as position}
	<AutoColliders shape="trimesh">
		<T.Mesh {position} scale={[tileSize, 0.1, tileSize]} receiveShadow castShadow={false}>
			<T.BoxGeometry />
			<T.MeshStandardMaterial color="white" roughness={0.9} metalness={0.1} />
		</T.Mesh>
	</AutoColliders>
{/each}
