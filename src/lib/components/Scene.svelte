<script lang="ts">
	import { CollisionGroups, RigidBody } from '@threlte/rapier';

	import Player from './Player/Player.svelte';

	import { Sky } from '@threlte/extras';

	import { isPlane } from '$lib/stores/commonStores';
	import { T } from '@threlte/core';

	import Ground from './models/Ground.svelte';
	import ProximityLoader from './ProximityLoader.svelte';

	const worldObjects = [
		{
			id: 'starting-room',
			position: [0, 0, 0],
			loader: () => import('./models/Starting-Room.svelte'),
			priority: 10 // High priority (spawn area)
		},
		{
			id: 'girl-dancing-1',
			position: [5, 0, 5],
			loader: () => import('./models/girl-dancing-1.svelte')
		},
		{
			id: 'girl-dancing-2',
			position: [-2.4, 0, -8],
			loader: () => import('./models/girl-dancing-2.svelte')
		},
		{
			id: 'car-1',
			position: [10, 0, -5],
			loader: () => import('./models/car-1.svelte')
		}
	];

	const { movement } = $props();

	let Environment = $state<ConstructorOfATypedSvelteComponent | null>(null);

	// Load environment only after ground is ready
	$effect(() => {
		if ($isPlane && !Environment) {
			// Dynamic import - code splits and loads asynchronously
			import('./Environment.svelte').then((m) => {
				Environment = m.default;
			});
		}
	});
</script>

<!-- <Environment url="/hdr.exr" /> -->

<!-- <T.HemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={0.4} /> -->
<T.AmbientLight intensity={0.3} />

<CollisionGroups groups={[0, 15]}>
	<RigidBody type={'fixed'}>
		<Ground />
	</RigidBody>
</CollisionGroups>

<!-- {#if Environment}
	<svelte:component this={Environment} />
{/if} -->

<ProximityLoader objects={worldObjects} loadRadius={25} unloadRadius={60} loadDelay={150} />

{#if $isPlane}
	<Player {movement} />
{/if}
