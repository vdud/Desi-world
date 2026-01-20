<script lang="ts">
	import { T } from '@threlte/core';
	import { AutoColliders, Collider, CollisionGroups, Debug, RigidBody } from '@threlte/rapier';

	// import Door from '../../rapier/world/Door.svelte';
	import Player from './Player.svelte';

	import { OrbitControls, Environment, Sky, SoftShadows } from '@threlte/extras';

	import { GLTF, useGltf } from '@threlte/extras';
	import { derived } from 'svelte/store';
	import RAPIER from '@dimforge/rapier3d-compat';
	import MainGate from './models/MainGate.svelte';
	import { AmbientLight } from 'three';
	import CasinoBuilding from './models/CasinoBuilding.svelte';
	import Ground from './models/Ground.svelte';
	import Walls from './models/Walls.svelte';
	import EntrySign from './models/EntrySign.svelte';
	import CasinoDoor from './models/CasinoDoor.svelte';
	import CasinoBoard from './models/CasinoBoard.svelte';
	import Wall from './models/Wall.svelte';
	import Plane from './models/Plane.svelte';
	import { isPlane } from '$lib/stores/commonStores';

	let nsubdivs = 10;
	let heights = [];
	const scale = new RAPIER.Vector3(10.0, 1, 10);
</script>

<!-- <T.DirectionalLight castShadow position={[8, 20, -3]} /> -->
<!-- <T.AmbientLight intensity={0.2} /> -->
<!-- sky -->
<!-- <Environment
	path="/"
	files="hdr2.hdr"
	isBackground={true}
	groundProjection={{ radius: 200, height: 5, scale: { x: 100, y: 100, z: 100 } }}
/> -->

<Sky setEnvironment={true} elevation={0} />
<!-- <T.DirectionalLight castShadow position={[0, 20, 0]} scale={2} rotation={[0, 0, 0]} intensity={1} /> -->
<!-- <T.AmbientLight castShadow intensity={0.3} /> -->

<!-- <Debug /> -->

<!-- <T.GridHelper args={[50]} position.y={0.01} /> -->

<CollisionGroups groups={[0, 15]}>
	<RigidBody type={'fixed'}>
		<!-- <Ground /> -->
		<Plane />
		<!-- <Walls /> -->
		<Wall />

		<MainGate />
		<!-- <EntrySign /> -->

		<CasinoBuilding />
		<CasinoDoor />
		<CasinoBoard />
	</RigidBody>
</CollisionGroups>

{#if $isPlane}
	<Player />
{/if}
