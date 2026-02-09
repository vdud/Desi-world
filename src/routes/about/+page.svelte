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
		padding-top: 4rem;
		max-width: 800px;
	}

	h1 {
		font-size: 3rem;
		background: linear-gradient(to right, #fff, #888);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.lead {
		font-size: 1.5rem;
		color: #888;
		margin-bottom: 3rem;
	}

	.skeleton-block {
		background: rgba(255, 255, 255, 0.05);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		margin-bottom: 3rem;
	}

	.back-link {
		color: #666;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: white;
	}
</style>
