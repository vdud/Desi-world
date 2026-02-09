<script lang="ts">
</script>

<svelte:head>
	<title>How It Works | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>How It Works</h1>
	<p class="lead">Under the hood of the metaverse.</p>

	<div class="steps">
		<div class="step">
			<h3>1. The URL is the World</h3>
			<p>
				No downloads. When you visit the link, you are streaming the world instantly via standard
				web technologies.
			</p>
		</div>
		<div class="step">
			<h3>2. Distributed Networking</h3>
			<p>We use edge-networking to sync player movements and voice with minimal latency.</p>
		</div>
		<div class="step">
			<h3>3. Your Identity</h3>
			<p>Your avatar is yours. We are building standards to let you take it anywhere.</p>
		</div>
	</div>

	<a href="/" class="back-link">← Back to Home</a>
</div>

<style>
	.page-content {
		padding-top: 4rem;
		max-width: 800px;
	}

	h1 {
		font-size: 3rem;
		color: var(--text-primary);
	}

	.lead {
		font-size: 1.5rem;
		color: var(--text-secondary);
		margin-bottom: 4rem;
	}

	.steps {
		display: grid;
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.step {
		padding-left: 1rem;
		border-left: 2px solid var(--accent-color);
	}

	h3 {
		color: var(--text-primary);
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	p {
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.back-link {
		color: var(--text-secondary);
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--text-primary);
	}
</style>
