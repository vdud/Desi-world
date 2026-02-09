<script lang="ts">
</script>

<svelte:head>
	<title>Community Guidelines | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>Community Guidelines</h1>
	<p class="lead">Keeping the metaverse safe for everyone.</p>

	<div class="guidelines">
		<section>
			<h3>1. Be Respectful</h3>
			<p>Harassment, hate speech, and abuse are not tolerated.</p>
		</section>
		<section>
			<h3>2. Safe Content</h3>
			<p>No NSFW content in public spaces.</p>
		</section>
		<section>
			<h3>3. Fair Play</h3>
			<p>Cheating or exploiting bugs to grief others will result in bans.</p>
		</section>
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

	.guidelines section {
		margin-bottom: 2rem;
	}

	h3 {
		color: var(--text-primary);
		margin-bottom: 0.5rem;
		font-size: 1.5rem;
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
