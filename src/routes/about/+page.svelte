<script lang="ts">
</script>

<svelte:head>
	<title>About | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>About root0</h1>
	<p class="lead">Building the next generation of immersive web experiences.</p>

	<div class="skeleton-block">
		<!-- Content will go here -->
		<p>
			root0 is a platform designed to bring high-fidelity 3D environments directly to the browser.
			No downloads, no installs, just instant immersion.
		</p>
	</div>

	<a href="/" class="back-link">← Back to Home</a>
</div>

<style>
	.page-content {
		padding-top: 8rem;
		max-width: 800px;
	}

	h1 {
		font-size: 3rem;
		/* Use text-primary with a subtle gradient effect if desired, or just solid */
		color: var(--text-primary);
		opacity: 0.95;
	}

	.lead {
		font-size: 1.5rem;
		color: var(--text-secondary);
		margin-bottom: 3rem;
	}

	.skeleton-block {
		background: rgba(125, 125, 125, 0.05); /* Slightly visible in both modes */
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid var(--border-color);
		margin-bottom: 3rem;
	}

	.back-link {
		color: var(--text-secondary);
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--text-primary);
	}
</style>
