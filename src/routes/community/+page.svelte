<script lang="ts">
</script>

<svelte:head>
	<title>Community | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>Community</h1>
	<p class="lead">Join the conversation.</p>

	<div class="community-links">
		<a href="https://discord.gg/example" target="_blank" class="community-card discord">
			<h3>Discord</h3>
			<p>Chat with other players and devs.</p>
		</a>
		<a href="https://twitter.com/example" target="_blank" class="community-card twitter">
			<h3>Twitter / X</h3>
			<p>Follow for latest updates.</p>
		</a>
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
		background: linear-gradient(to right, #fff, #999);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.lead {
		font-size: 1.5rem;
		color: #888;
		margin-bottom: 4rem;
	}

	.community-links {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		margin-bottom: 3rem;
	}

	.community-card {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		text-decoration: none;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition:
			transform 0.2s,
			background 0.2s;
	}

	.community-card:hover {
		transform: translateY(-2px);
		background: rgba(255, 255, 255, 0.1);
	}

	h3 {
		color: white;
		margin-bottom: 0.5rem;
	}

	p {
		color: #aaa;
		margin: 0;
	}

	.back-link {
		color: #666;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: white;
	}
</style>
