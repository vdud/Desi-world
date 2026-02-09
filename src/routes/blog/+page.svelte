<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Blog | root0</title>
	<meta name="description" content="Latest updates, news, and insights from the root0 team." />
</svelte:head>

<div class="container page-content">
	<h1>Latest Updates</h1>
	<p class="lead">News from the metaverse frontier.</p>

	<div class="posts-grid">
		{#each data.posts as post}
			<a href="/blog/{post.slug}" class="post-card">
				<h2>{post.title}</h2>
				<p class="date">{new Date(post.date).toLocaleDateString()}</p>
				<p class="desc">{post.description}</p>
				<span class="read-more">Read Article →</span>
			</a>
		{/each}
	</div>

	<a href="/" class="back-link">← Back to Home</a>
</div>

<style>
	.page-content {
		padding-top: 6rem;
		max-width: 800px;
		margin: 0 auto;
		padding-left: 2rem;
		padding-right: 2rem;
	}

	h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.lead {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: 4rem;
	}

	.posts-grid {
		display: grid;
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.post-card {
		display: block;
		background: transparent;
		border: 1px solid var(--border-color);
		padding: 2rem;
		border-radius: 4px; /* Minimal/Brutalist */
		color: inherit;
		text-decoration: none;
		transition:
			transform 0.4s var(--ease-out-expo),
			background 0.4s var(--ease-out-expo),
			border-color 0.4s;
	}

	.post-card:hover {
		background: rgba(128, 128, 128, 0.05);
		transform: translateY(-4px);
		border-color: var(--text-secondary);
	}

	.post-card h2 {
		margin-top: 0;
		font-size: 1.5rem;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.date {
		font-size: 0.85rem;
		color: var(--text-secondary);
		margin-bottom: 1rem;
		opacity: 0.8;
		font-family: monospace;
	}

	.desc {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.read-more {
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 4px;
		opacity: 0.8;
	}

	.back-link {
		color: var(--text-secondary);
		transition: color 0.2s;
		display: inline-block;
		margin-bottom: 2rem;
	}

	.back-link:hover {
		color: var(--text-primary);
	}
</style>
