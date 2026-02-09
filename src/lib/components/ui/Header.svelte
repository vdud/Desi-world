<script lang="ts">
	import ConnectWallet from '$lib/components/ui/ConnectWallet.svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let scrollY = $state(0);

	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
		};
		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<nav class="nav" class:scrolled={scrollY > 50} in:fade={{ duration: 1000, delay: 200 }}>
	<a href="/" class="logo">root<span class="zero">0</span></a>
	<div class="actions">
		<a href="/about" class="nav-link">Manifesto</a>
		<a href="/world" class="nav-link">The World</a>
		<div class="wallet-wrapper">
			<ConnectWallet />
		</div>
	</div>
</nav>

<style>
	/* Navigation */
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		padding: 2rem 3rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 100;
		box-sizing: border-box;
		transition:
			padding 0.5s var(--ease-out-expo),
			background 0.5s;
	}

	.nav.scrolled {
		padding: 1rem 3rem;
		background: var(--bg-primary); /* Use variable instead of hardcoded rgba */
		border-bottom: 1px solid var(--border-color);
	}

	.logo {
		font-size: 1.25rem;
		font-weight: 500;
		letter-spacing: -0.02em;
		opacity: 0.9;
		color: var(--text-primary);
		text-decoration: none;
	}

	.zero {
		font-family: var(--font-serif);
		font-style: italic;
		opacity: 0.6;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.nav-link {
		font-size: 0.9rem;
		color: var(--text-secondary);
		opacity: 0.7;
		transition: opacity 0.3s;
		text-decoration: none;
	}

	.nav-link:hover {
		opacity: 1;
		color: var(--text-primary);
	}
</style>
