<script>
	// src/routes/marketplace/+page.svelte
</script>

<svelte:head>
	<title>Marketplace | root0</title>
	<meta name="description" content="Trade assets, skins, and lands in the root0 metaverse." />
</svelte:head>

<div class="page-container">
	<div class="content">
		<h1>Marketplace</h1>
		<p class="subtitle">Coming Soon</p>
		<p class="description">
			Buy, sell, and trade unique digital assets within the root0 ecosystem.
		</p>
		<a href="/play" class="btn-primary">Back to World</a>
	</div>
</div>

<style>
	.page-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--bg-color);
		color: var(--text-color);
		position: relative;
		overflow: hidden;
	}

	.page-container::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: var(--bg-noise);
		opacity: 0.05;
		pointer-events: none;
		z-index: 0;
	}

	.content {
		position: relative;
		z-index: 1;
		text-align: center;
		max-width: 600px;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(10px);
		border: 1px solid var(--border-color);
		border-radius: 24px;
	}

	h1 {
		font-family: var(--font-serif);
		font-size: 3rem;
		margin-bottom: 0.5rem;
		background: linear-gradient(to left, #fff, #6c6c6c);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.subtitle {
		font-family: var(--font-mono);
		color: var(--primary-color);
		text-transform: uppercase;
		letter-spacing: 2px;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
	}

	.description {
		color: var(--text-muted);
		line-height: 1.6;
		margin-bottom: 2.5rem;
		font-size: 1.1rem;
	}

	.btn-primary {
		display: inline-block;
		padding: 12px 32px;
		background: #fff;
		color: #000;
		border-radius: 100px;
		text-decoration: none;
		font-weight: 600;
		transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
	}

	.btn-primary:hover {
		transform: scale(1.05);
	}
</style>
