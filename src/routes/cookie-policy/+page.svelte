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
		background: linear-gradient(to right, #fff, #999);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.updated {
		color: #666;
		margin-bottom: 3rem;
	}

	.skeleton-block {
		background: rgba(255, 255, 255, 0.05);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		margin-bottom: 3rem;
	}

	h2 {
		color: #e0e0e0;
		margin-top: 2rem;
	}

	p {
		color: #aaa;
	}

	.back-link {
		color: #666;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: white;
	}
</style>
