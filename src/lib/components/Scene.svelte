<script lang="ts">
	import { CollisionGroups, RigidBody } from '@threlte/rapier';

	import Player from './Player/Player.svelte';

	import { Sky } from '@threlte/extras';

	import { isPlane } from '$lib/stores/commonStores';
	import { T } from '@threlte/core';

	import Ground from './models/Ground.svelte';
	import StartingRoom from './models/Starting-Room.svelte';
	import GirlDancing1 from './models/girl-dancing-1.svelte';
	import GirlDancing2 from './models/girl-dancing-2.svelte';
	import Car1 from './models/car-1.svelte';

	const { movement } = $props();
</script>

<Sky elevation={1} castShadow turbidity={10} rayleigh={4} mieCoefficient={0.005} />
<!-- <Stars count={500} radius={80} depth={150} speed={1} /> -->

<T.DirectionalLight
	position={[1, 10, -10]}
	intensity={1.5}
	castShadow
	shadow.mapSize={[4096, 4096]}
	shadow.bias={-0.0001}
	shadow.normalBias={0.02}
	shadow.radius={10}
	shadow.camera.near={0.5}
	shadow.camera.far={50}
	shadow.camera.left={-20}
	shadow.camera.right={20}
	shadow.camera.top={20}
	shadow.camera.bottom={-20}
/>

<!-- <Environment url="/hdr.exr" /> -->

<!-- <T.HemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={0.4} /> -->
<T.AmbientLight intensity={0.3} />

<CollisionGroups groups={[0, 15]}>
	<RigidBody type={'fixed'}>
		<Ground />
		<StartingRoom />
		<GirlDancing1 />
		<GirlDancing2 />
		<Car1 />
	</RigidBody>
</CollisionGroups>

{#if $isPlane}
	<Player {movement} />
{/if}
