<script lang="ts">
	import favicon from '$lib/assets/root0-favicon/favicon.ico';
	import '../app.css';

	import { dev } from '$app/environment';

	import Header from '$lib/components/ui/Header.svelte';
	import { page } from '$app/state';
	import { inject } from '@vercel/analytics';
	import { economy } from '$lib/game/economy.svelte.ts';
	import { onMount } from 'svelte';
	import { web3 } from '$lib/web3/web3.svelte';

	inject({ mode: dev ? 'development' : 'production' });
	let { children } = $props();

	onMount(() => {
		const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID';
		web3.init(projectId);
	});

	economy.startListening();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		rel="canonical"
		href="https://root0.online{page.url.pathname === '/' ? '' : page.url.pathname}"
	/>
</svelte:head>

<!-- Don't show the global header on the game page -->
{#if !page.url.pathname.startsWith('/play')}
	<Header />
{/if}

{@render children()}
