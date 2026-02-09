<script lang="ts">
</script>

<svelte:head>
	<title>Privacy Policy | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>Privacy Policy</h1>
	<p class="updated">Last updated: February 2026</p>

	<div class="skeleton-block">
		<h2>1. Data Collection</h2>
		<p>We collect minimal data required to operate the service...</p>

		<h2>2. Usage</h2>
		<p>Data is used solely for improving user experience...</p>
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
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.updated {
		color: var(--text-secondary);
		margin-bottom: 3rem;
	}

	.skeleton-block {
		background: rgba(125, 125, 125, 0.05);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid var(--border-color);
		margin-bottom: 3rem;
	}

	h2 {
		color: var(--text-primary);
		margin-top: 2rem;
	}

	p {
		color: var(--text-secondary);
	}

	.back-link {
		color: var(--text-secondary);
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--text-primary);
	}
</style>
