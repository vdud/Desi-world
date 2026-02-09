<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>404 | Page Not Found</title>
</svelte:head>

<div class="container error-page">
	<h1>404</h1>
	<p class="message">The page you are looking for has floated away.</p>

	<a href="/" class="btn">Return to Earth</a>
</div>

<style>
	.error-page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	h1 {
		font-size: 8rem;
		margin: 0;
		background: linear-gradient(to bottom, #fff, #333);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		line-height: 1;
	}

	.message {
		font-size: 1.5rem;
		color: #888;
		margin-bottom: 3rem;
	}
</style>
