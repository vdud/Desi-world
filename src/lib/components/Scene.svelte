<script lang="ts">
	import { CollisionGroups, RigidBody } from '@threlte/rapier';

	import Player from './Player/Player.svelte';

	import { isPlane } from '$lib/stores/commonStores';
	import { T } from '@threlte/core';

	import Ground from './models/Ground.svelte';
	import ProximityLoader from './ProximityLoader.svelte';

	const worldObjects = [
		{
			id: 'starting-room',
			position: [0, 0, 0],
			loader: () => import('./models/Starting-Room.svelte'),
			priority: 10
		},
		{
			id: 'girl-dancing-1',
			position: [5, 0, 5],
			loader: () => import('./models/StartingRoom Models/girl-dancing-1.svelte')
		},
		{
			id: 'girl-dancing-2',
			position: [-2.4, 0, -8],
			loader: () => import('./models/StartingRoom Models/girl-dancing-2.svelte')
		},
		{
			id: 'car-1',
			position: [10, 0, -5],
			loader: () => import('./models/StartingRoom Models/car-1.svelte')
		},
		{
			id: 'carpet',
			position: [2, 0, -13],
			loader: () => import('./models/StartingRoom Models/carpet.svelte')
		},
		{
			id: 'ottoman-pillow-and-carpets',
			position: [0, 0, -7],

			loader: () => import('./models/StartingRoom Models/ottoman_pillow_and_carpets_v2.svelte')
		},
		{
			id: 'technival-speakers-wall',
			position: [-10, 0, -5],
			loader: () => import('./models/StartingRoom Models/technival_speakers_wall.svelte')
		}
	];

	const { movement } = $props();
</script>

<T.AmbientLight intensity={0.3} />

<CollisionGroups groups={[0, 15]}>
	<RigidBody type={'fixed'}>
		<Ground />
	</RigidBody>
</CollisionGroups>

<ProximityLoader objects={worldObjects} loadRadius={25} unloadRadius={60} loadDelay={150} />

{#if $isPlane}
	<Player {movement} />
{/if}
