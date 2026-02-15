<!-- src/lib/components/ui/Header.svelte -->
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
		<a href="/dashboard" class="nav-link">Dashboard</a>
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
		padding: 2rem 4rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 1000;
		box-sizing: border-box;
		transition:
			padding 0.4s var(--ease-out-expo),
			background 0.4s var(--ease-out-expo),
			border-color 0.4s var(--ease-out-expo),
			backdrop-filter 0.4s var(--ease-out-expo);
		background: transparent;
		border-bottom: 1px solid transparent;
	}

	/* Glassmorphism state on scroll */
	.nav.scrolled {
		padding: 1.25rem 4rem;
		background: rgba(10, 10, 10, 0.7);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--text-primary);
		text-decoration: none;
		display: flex;
		align-items: center;
		transition: transform 0.3s var(--ease-out-expo);
	}

	.logo:hover {
		transform: scale(1.02);
	}

	.zero {
		font-family: var(--font-serif);
		font-style: italic;
		opacity: 0.6;
		font-weight: 400;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 2.5rem;
	}

	.nav-link {
		position: relative;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.3s ease;
		letter-spacing: 0.02em;
	}

	.nav-link:hover {
		color: var(--text-primary);
	}

	/* Animated underline */
	.nav-link::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 0;
		height: 1px;
		background: var(--text-primary);
		transition: width 0.3s var(--ease-out-expo);
		opacity: 0.8;
	}

	.nav-link:hover::after {
		width: 100%;
	}

	/* Responsive adjustment */
	@media (max-width: 768px) {
		.nav {
			padding: 1.5rem 1.5rem;
		}
		.nav.scrolled {
			padding: 1rem 1.5rem;
		}
		.actions {
			gap: 1.5rem;
		}
		.nav-link {
			display: none; /* Hide links on mobile for now, keep wallet */
		}
	}
</style>
