<!-- src/lib/components/Environment.svelte -->
<script lang="ts">
	import { CollisionGroups, RigidBody } from '@threlte/rapier';
	import StartingRoom from './models/Starting-Room.svelte';
	import GirlDancing1 from './models/girl-dancing-1.svelte';
	import GirlDancing2 from './models/girl-dancing-2.svelte';
	import Car1 from './models/car-1.svelte';

	// Props for progressive loading stages if needed
	let { loaded = $bindable(true) } = $props();
</script>

<CollisionGroups groups={[0, 15]}>
	<RigidBody type={'fixed'}>
		<StartingRoom />
		<GirlDancing1 />
		<GirlDancing2 />
		<Car1 />
	</RigidBody>
</CollisionGroups>
