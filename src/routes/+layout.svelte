<script lang="ts">
	import favicon from '$lib/assets/root0-favicon/favicon.ico';
	import '../app.css';

	import { dev } from '$app/environment';

	import Header from '$lib/components/ui/Header.svelte';
	import { page } from '$app/state';
	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Don't show the global header on the game page -->
{#if !page.url.pathname.startsWith('/play')}
	<Header />
{/if}

{@render children()}
