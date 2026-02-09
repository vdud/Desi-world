<script lang="ts">
	import ConnectWallet from '$lib/components/ui/ConnectWallet.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>root0 | The Metaverse is Here</title>
	<meta name="description" content="Join the next generation of web-based metaverse experiences." />
</svelte:head>

<header class="navbar">
	<div class="logo">M</div>
	<div class="actions">
		<ConnectWallet />
	</div>
</header>

<main class="hero">
	<div class="content">
		<h1 class="glitch-text" data-text="root0">root0</h1>
		<p class="subtitle">Experience the future of the web. No install required.</p>

		<div class="cta-container">
			<a href="/play" class="play-btn">
				Enter World
				<span class="arrow">→</span>
			</a>
		</div>
	</div>

	<footer class="footer">
		<nav>
			<div class="nav-group">
				<h3>Product</h3>
				<a href="/world">The World</a>
				<a href="/how-it-works">How It Works</a>
				<a href="/roadmap">Roadmap</a>
				<a href="/changelog">Changelog</a>
				<a href="/faq">FAQ</a>
			</div>

			<div class="nav-group">
				<h3>Community</h3>
				<a href="/blog">Blog</a>
				<a href="/community">Connect</a>
				<a href="/community-guidelines">Community Guidelines</a>
			</div>

			<div class="nav-group">
				<h3>Legal</h3>
				<a href="/about">About</a>
				<a href="/privacy-policy">Privacy Policy</a>
				<a href="/terms-of-service">Terms of Service</a>
				<a href="/cookie-policy">Cookie Policy</a>
			</div>
		</nav>
		<p>&copy; 2026 root0. All rights reserved.</p>
	</footer>
</main>

<style>
	.navbar {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		padding: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 100;
		box-sizing: border-box;
	}

	.logo {
		font-weight: 900;
		font-size: 1.5rem;
		color: white;
	}

	.hero {
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%);
		position: relative;
		overflow: hidden;
	}

	.content {
		text-align: center;
		z-index: 10;
	}

	h1 {
		font-size: 6rem;
		font-weight: 900;
		letter-spacing: -0.05em;
		background: linear-gradient(to right, #ffffff, #a0a0ff);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin-bottom: 1rem;
		animation: float 6s ease-in-out infinite;
	}

	.subtitle {
		font-size: 1.5rem;
		color: #888;
		margin-bottom: 3rem;
		font-weight: 300;
	}

	.play-btn {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		font-size: 1.5rem;
		padding: 1rem 3rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		border-radius: 50px;
		color: white;
		text-decoration: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 0 20px rgba(100, 108, 255, 0.2);
	}

	.play-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.05);
		box-shadow: 0 0 40px rgba(100, 108, 255, 0.4);
	}

	.arrow {
		transition: transform 0.3s;
	}

	.play-btn:hover .arrow {
		transform: translateX(5px);
	}

	.footer {
		position: absolute;
		bottom: 2rem;
		width: 100%;
		text-align: center;
		color: #444;
		font-size: 0.9rem;
	}

	.footer nav {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		max-width: 800px;
		margin: 0 auto 3rem;
		text-align: left;
	}

	.nav-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.nav-group h3 {
		color: white;
		font-size: 1rem;
		margin-bottom: 0.5rem;
		opacity: 0.8;
	}

	.footer a {
		color: #666;
		text-decoration: none;
		transition: color 0.2s;
	}

	.footer a:hover {
		color: white;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	/* Glitch effect could be added here for extra style */
</style>
