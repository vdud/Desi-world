<script lang="ts">
</script>

<svelte:head>
	<title>The World | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>The World</h1>
	<p class="lead">Explore a seamless digital universe.</p>

	<div class="features-grid">
		<div class="feature-card">
			<h3>Seamless</h3>
			<p>No loading screens. Just walk from one experience to another.</p>
		</div>
		<div class="feature-card">
			<h3>Social</h3>
			<p>Real-time multiplayer with voice and text chat.</p>
		</div>
		<div class="feature-card">
			<h3>Creative</h3>
			<p>Build your own spaces and share them with the world.</p>
		</div>
	</div>

	<a href="/" class="back-link">← Back to Home</a>
</div>

<style>
	.page-content {
		padding-top: 4rem;
	}

	h1 {
		font-size: 4rem;
		background: linear-gradient(to right, #646cff, #a0a0ff);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.lead {
		font-size: 1.5rem;
		color: #aaa;
		margin-bottom: 4rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.feature-card {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		transition: transform 0.3s;
	}

	.feature-card:hover {
		transform: translateY(-5px);
		background: rgba(255, 255, 255, 0.06);
	}

	h3 {
		font-size: 1.5rem;
		color: white;
		margin-bottom: 1rem;
	}

	p {
		color: #aaa;
		line-height: 1.6;
	}

	.back-link {
		color: #666;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: white;
	}
</style>
