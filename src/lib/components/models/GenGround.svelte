<script>
	import { T } from '@threlte/core';
	import { InstancedMesh, Instance } from '@threlte/extras';
	import { AutoColliders } from '@threlte/rapier';

	const size = 30;
	const tileSize = 5;
	const gap = 0.2;
	const y = -0.05;

	const step = tileSize + gap;
	const offset = ((size - 1) * step) / 2;

	// Generate instance data
	const instances = [];
	for (let x = 0; x < size; x++) {
		for (let z = 0; z < size; z++) {
			instances.push({
				id: `${x}-${z}`,
				position: [x * step - offset, y, z * step - offset]
			});
		}
	}

	// Calculate total floor dimensions for single collider
	const totalWidth = size * tileSize + (size - 1) * gap;
</script>

<!-- 
  OPTIMIZED PHYSICS: Single collider for entire floor
  Reduces physics objects from 100 to 1. 
  If you need to detect WHICH tile is stepped on, calculate it from 
  the contact point (x,z) coordinates instead of using 100 colliders.
-->
<AutoColliders shape="cuboid">
	<T.Mesh position={[0, y, 0]} scale={[totalWidth, 0.1, totalWidth]} visible={false}>
		<T.BoxGeometry />
	</T.Mesh>
</AutoColliders>

<!-- 
  OPTIMIZED RENDERING: Single draw call for all tiles
  InstancedMesh batches all instances into one GPU draw call
-->
<InstancedMesh receiveShadow>
	<T.BoxGeometry />
	<T.MeshStandardMaterial color="white" roughness={0.9} metalness={0.1} />

	{#each instances as instance (instance.id)}
		<Instance position={instance.position} scale={[tileSize, 0.1, tileSize]} />
	{/each}
</InstancedMesh>

<!-- 
  Wireframe replacement: GridHelper is infinitely cheaper than 100 Wireframe components.
  Positioned slightly above tiles to prevent z-fighting.
-->
<!-- <T.GridHelper args={[totalWidth, size, 'black', 'black']} position={[0, y + 0.06, 0]} /> -->
