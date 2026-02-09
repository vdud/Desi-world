<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.meta.title} | root0 Blog</title>
	<meta name="description" content={data.meta.description} />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
</svelte:head>

<div class="container page-content">
	<article>
		<header>
			<h1>{data.meta.title}</h1>
			<p class="meta">
				Published on {new Date(data.meta.date).toLocaleDateString()} by {data.meta.author}
			</p>
		</header>

		<div class="markdown-body">
			<data.content />
		</div>
	</article>

	<a href="/blog" class="back-link">← Back to Blog</a>
</div>

<style>
	.page-content {
		padding-top: 6rem;
		max-width: 800px;
		margin: 0 auto;
		padding-left: 2rem;
		padding-right: 2rem;
	}

	header {
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 2rem;
	}

	h1 {
		font-size: clamp(2.5rem, 5vw, 4rem);
		line-height: 1.1;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.meta {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-family: monospace;
		opacity: 0.8;
	}

	/* Simple Markdown Styling */
	:global(.markdown-body h2) {
		margin-top: 3rem;
		margin-bottom: 1rem;
		font-size: 1.8rem;
		color: var(--text-primary);
		letter-spacing: -0.02em;
	}

	:global(.markdown-body p) {
		margin-bottom: 1.5rem;
		line-height: 1.7;
		color: var(--text-primary);
		opacity: 0.9;
		font-size: 1.1rem;
	}

	:global(.markdown-body ul) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
		color: var(--text-secondary);
	}

	:global(.markdown-body li) {
		margin-bottom: 0.5rem;
	}

	:global(.markdown-body strong) {
		font-weight: 600;
		color: var(--text-primary);
	}

	.back-link {
		display: inline-block;
		margin-top: 4rem;
		margin-bottom: 3rem;
		color: var(--text-secondary);
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--text-primary);
	}
</style>
