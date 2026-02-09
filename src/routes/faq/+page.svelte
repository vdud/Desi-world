<script lang="ts">
	let faqs = $state([
		{
			q: 'Do I need to download anything?',
			a: 'No! root0 runs entirely in your web browser.'
		},
		{
			q: 'Is it free?',
			a: 'Yes, the core experience is free to access.'
		},
		{
			q: 'Can I use VR?',
			a: 'VR support is on our roadmap. Stay tuned!'
		}
	]);
</script>

<svelte:head>
	<title>FAQ | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>Frequently Asked Questions</h1>

	<div class="faq-grid">
		{#each faqs as faq}
			<div class="faq-card">
				<h3>{faq.q}</h3>
				<p>{faq.a}</p>
			</div>
		{/each}
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
		margin-bottom: 3rem;
		color: var(--text-primary);
	}

	.faq-grid {
		display: grid;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.faq-card {
		background: rgba(125, 125, 125, 0.05);
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid var(--border-color);
	}

	h3 {
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	p {
		color: var(--text-secondary);
		margin: 0;
	}

	.back-link {
		color: var(--text-secondary);
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--text-primary);
	}
</style>
