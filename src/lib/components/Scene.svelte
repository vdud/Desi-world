<script lang="ts">
	import { CollisionGroups, RigidBody } from '@threlte/rapier';

	import Player from './Player/Player.svelte';

	import { Sky } from '@threlte/extras';

	import MainGate from './models/MainGate.svelte';
	import { isPlane } from '$lib/stores/commonStores';
	import Ground from './models/Ground.svelte';

	const { movement } = $props();
</script>

<Sky setEnvironment={true} elevation={0} />

<CollisionGroups groups={[0, 15]}>
	<RigidBody type={'fixed'}>
		<Ground />
		<MainGate />
	</RigidBody>
</CollisionGroups>

{#if $isPlane}
	<Player {movement} />
{/if}
