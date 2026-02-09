<script lang="ts">
</script>

<svelte:head>
	<title>Changelog | root0</title>
</svelte:head>

<div class="container page-content">
	<h1>Changelog</h1>
	<p class="lead">Track our journey.</p>

	<div class="timeline">
		<div class="entry">
			<div class="date">Feb 2026</div>
			<div class="content">
				<h3>root0 Alpha</h3>
				<p>
					Initial public release of the core engine. Features include physics-based movement,
					multiplayer foundation, and seamless world streaming.
				</p>
			</div>
		</div>
		<!-- More entries -->
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

	.timeline {
		border-left: 2px solid var(--border-color);
		padding-left: 2rem;
		margin-bottom: 3rem;
	}

	.entry {
		margin-bottom: 3rem;
		position: relative;
	}

	.entry::before {
		content: '';
		position: absolute;
		left: -2.35rem; /* Adjust circle position */
		top: 0.5rem;
		width: 0.8rem;
		height: 0.8rem;
		background: var(--accent-color);
		border-radius: 50%;
		border: 4px solid var(--bg-primary);
	}

	.date {
		font-size: 0.9rem;
		color: var(--accent-color);
		font-weight: 600;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	h3 {
		color: var(--text-primary);
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
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
