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
		padding-top: 4rem;
		max-width: 800px;
	}

	h1 {
		font-size: 3rem;
		margin-bottom: 0.5rem;
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

	.posts-grid {
		display: grid;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.post-card {
		display: block;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 2rem;
		border-radius: 12px;
		color: inherit;
		text-decoration: none;
		transition:
			transform 0.2s,
			background 0.2s;
	}

	.post-card:hover {
		background: rgba(255, 255, 255, 0.06);
		transform: translateY(-2px);
	}

	.post-card h2 {
		margin-top: 0;
		font-size: 1.5rem;
		color: white;
	}

	.date {
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 1rem;
	}

	.desc {
		color: #aaa;
		margin-bottom: 1.5rem;
	}

	.read-more {
		color: var(--accent-color);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.back-link {
		color: #666;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: white;
	}
</style>
