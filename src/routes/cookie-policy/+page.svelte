<script lang="ts">
</script>

<svelte:head>
	<title>Cookie Policy | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>Cookie Policy</h1>
	<p class="updated">Last updated: February 2026</p>

	<div class="skeleton-block">
		<h2>1. Use of Cookies</h2>
		<p>We use cookies to enhance your experience...</p>

		<h2>2. Managing Preferences</h2>
		<p>You can manage your cookie preferences in your browser settings...</p>
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
		font-weight: 800;
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
