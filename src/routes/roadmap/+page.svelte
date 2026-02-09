<script lang="ts">
</script>

<svelte:head>
	<title>Roadmap | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>Roadmap</h1>
	<p class="lead">Where we are going.</p>

	<div class="roadmap-grid">
		<div class="phase active">
			<h3>Phase 1: Foundation (Current)</h3>
			<ul>
				<li>Core Physics Engine</li>
				<li>Basic Multiplayer</li>
				<li>World Streaming</li>
			</ul>
		</div>
		<div class="phase">
			<h3>Phase 2: Expression</h3>
			<ul>
				<li>Avatar Customization</li>
				<li>Voice Chat V2</li>
				<li>Emotes & Gestures</li>
			</ul>
		</div>
		<div class="phase">
			<h3>Phase 3: Creation</h3>
			<ul>
				<li>User-Generated Spaces</li>
				<li>Scripting API</li>
				<li>Economy Basics</li>
			</ul>
		</div>
	</div>

	<a href="/" class="back-link">← Back to Home</a>
</div>

<style>
	.page-content {
		padding-top: 4rem;
		max-width: 900px;
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

	.roadmap-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		margin-bottom: 3rem;
	}

	.phase {
		padding: 2rem;
		background: rgba(125, 125, 125, 0.03);
		border: 1px solid var(--border-color);
		border-radius: 12px;
	}

	.phase.active {
		border-color: var(--accent-color);
		background: rgba(125, 125, 125, 0.05);
	}

	h3 {
		color: var(--text-primary);
		margin-bottom: 1.5rem;
		font-size: 1.3rem;
	}

	ul {
		padding-left: 1.2rem;
		color: var(--text-secondary);
	}

	li {
		margin-bottom: 0.5rem;
	}

	.back-link {
		color: var(--text-secondary);
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--text-primary);
	}
</style>
