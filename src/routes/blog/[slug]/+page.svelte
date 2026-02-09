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
		padding-top: 4rem;
		max-width: 800px;
	}

	header {
		margin-bottom: 2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 2rem;
	}

	h1 {
		font-size: 3rem;
		line-height: 1.1;
		margin-bottom: 0.5rem;
		background: linear-gradient(to right, #fff, #aaa);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.meta {
		color: #666;
		font-size: 0.9rem;
	}

	/* Simple Markdown Styling */
	:global(.markdown-body h2) {
		margin-top: 2rem;
		margin-bottom: 1rem;
		font-size: 1.8rem;
		color: #ddd;
	}

	:global(.markdown-body p) {
		margin-bottom: 1.5rem;
		line-height: 1.7;
		color: #ccc;
	}

	:global(.markdown-body ul) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
		color: #ccc;
	}

	:global(.markdown-body li) {
		margin-bottom: 0.5rem;
	}

	.back-link {
		display: inline-block;
		margin-top: 3rem;
		color: #666;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: white;
	}
</style>
