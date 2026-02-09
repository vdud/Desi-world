<script lang="ts">
	import favicon from '$lib/assets/root0-favicon/favicon.ico';
	import '../app.css';

	import { dev } from '$app/environment';

	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
