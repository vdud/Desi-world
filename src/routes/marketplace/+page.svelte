<!-- src/routes/marketplace/+page.svelte -->
<script lang="ts">
	import { web3 } from '$lib/web3/web3.svelte';
	import { economy } from '$lib/game/economy.svelte.ts';
	// import Header from '$lib/components/ui/Header.svelte';
	import Minting from '$lib/components/ui/Minting.svelte';
	import ConnectWallet from '$lib/components/ui/ConnectWallet.svelte';
</script>

<svelte:head>
	<title>Marketplace | root0</title>
	<meta name="description" content="Trade assets, skins, and lands in the root0 metaverse." />
</svelte:head>

<div class="page-container">
	<!-- <Header /> -->

	<main class="main-grid">
		<!-- Sidebar -->
		<aside class="sidebar">
			<div class="mb-8">
				<h1 class="text-3xl font-bold tracking-tight mb-2" style="color: var(--text-primary);">
					MARKET
				</h1>
				<p class="text-xs uppercase tracking-widest" style="color: var(--text-secondary);">
					Decentralized Asset Exchange
				</p>
			</div>

			<Minting />

			<div class="mt-8 border-t pt-8" style="border-color: var(--border-color);">
				<h3
					class="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
					style="color: var(--text-secondary);"
				>
					Filter Assets
				</h3>
				<ul class="flex flex-col gap-2">
					{#each ['All Assets', 'Wearables', 'Land Deeds', 'Access Keys'] as category, i}
						<li>
							<button class="filter-btn" class:active={i === 0}>
								<span class="w-2 h-2 rounded-full bg-current opacity-50"></span>
								{category}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</aside>

		<!-- Product Grid -->
		<section class="content-area">
			{#if !web3.isConnected}
				<!-- Using your existing .terminal-box classes -->
				<div class="terminal-box gate-keeper">
					<div class="terminal-header">
						<div class="terminal-dot red"></div>
						<div class="terminal-dot yellow"></div>
						<div class="terminal-dot green"></div>
						<span class="terminal-title">secure_connection.sh</span>
					</div>
					<div class="terminal-body flex flex-col items-center justify-center text-center h-full">
						<p class="cmd-line mb-6">
							<span class="prompt">$</span> auth required --wallet
						</p>
						<ConnectWallet />
					</div>
					<div class="scan-line"></div>
				</div>
			{:else}
				<div class="item-grid">
					{#each economy.items as item}
						<article class="item-card">
							<div class="card-header">
								<span class="text-[10px] mono-accent">ASSET_{item.id}</span>
								<span class="status-dot"></span>
							</div>

							<div class="card-visual">
								<div class="placeholder-graphic">
									<span class="text-4xl opacity-50">⚔️</span>
									<div class="grid-overlay"></div>
								</div>
							</div>

							<div class="card-content">
								<h3 class="font-bold text-lg mb-3">{item.name}</h3>

								<div class="flex items-end justify-between">
									<div>
										<span
											class="block text-[9px] uppercase tracking-widest mb-1"
											style="color: var(--text-secondary);">Price</span
										>
										<div class="flex items-baseline gap-1">
											<span class="font-bold text-lg" style="color: var(--text-primary);"
												>{150}</span
											>
											<span class="text-xs mono-accent">ROOT</span>
										</div>
									</div>
									<button class="buy-btn"> Exchange </button>
								</div>
							</div>
						</article>
					{/each}

					{#if economy.items.length === 0}
						<div class="col-span-full py-24 text-center mono-accent">// NO_ASSETS_FOUND</div>
					{/if}
				</div>
			{/if}
		</section>
	</main>
</div>

<style>
	.page-container {
		min-height: 100vh;
		background: var(--bg-primary);
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
		background-size: 40px 40px;
		position: relative;
	}

	/* Main layout grid */
	.main-grid {
		margin: 0 auto;
		max-width: 1400px; /* Match your container width */
		padding: 8rem 2rem 3rem 2rem; /* Top padding for header */
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
	}

	@media (min-width: 768px) {
		.main-grid {
			grid-template-columns: 280px 1fr;
		}
	}

	/* Typography Helpers */
	.mono-accent {
		font-family: var(--font-mono);
		color: var(--terminal-accent);
	}

	/* Filter Buttons */
	.filter-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		color: var(--text-secondary);
		transition: all 150ms;
		border-radius: 4px;
		border: 1px solid transparent;
		text-align: left;
		background: transparent;
		cursor: pointer;
	}

	.filter-btn:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	.filter-btn.active {
		background: rgba(74, 246, 38, 0.05); /* Terminal accent with low opacity */
		color: var(--terminal-accent);
		border-color: rgba(74, 246, 38, 0.2);
	}

	/* Gate Keeper */
	.gate-keeper {
		min-height: 500px;
		position: relative;
		overflow: hidden;
	}

	.scan-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, var(--terminal-accent), transparent);
		animation: scan 4s linear infinite;
		pointer-events: none;
		bottom: 0; /* Initial position, animation takes over */
	}

	@keyframes scan {
		0% {
			top: 0%;
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			top: 100%;
			opacity: 0;
		}
	}

	/* Item Cards */
	.item-grid {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 1.25rem;
	}

	@media (min-width: 640px) {
		.item-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1024px) {
		.item-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.item-card {
		display: flex;
		flex-direction: column;
		border-radius: 6px;
		border: 1px solid var(--border-color);
		background: rgba(0, 0, 0, 0.2); /* Subtle background to pop on grid */
		transition: all 300ms var(--ease-out-expo);
		overflow: hidden;
	}

	.item-card:hover {
		border-color: rgba(74, 246, 38, 0.3);
		transform: translateY(-2px);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		border-bottom: 1px solid var(--border-color);
		background: rgba(255, 255, 255, 0.02);
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		background: var(--terminal-accent);
		box-shadow: 0 0 8px var(--terminal-accent);
	}

	.card-visual {
		aspect-ratio: 1 / 1;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background: var(--bg-primary);
	}

	.placeholder-graphic {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.grid-overlay {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
		background-size: 20px 20px;
		opacity: 0.2;
		pointer-events: none;
	}

	.card-content {
		padding: 1rem;
		border-top: 1px solid var(--border-color);
	}

	.buy-btn {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: all 150ms;
		background: transparent;
		color: var(--terminal-accent);
		border: 1px solid var(--terminal-accent);
		cursor: pointer;
	}

	.buy-btn:hover {
		background: var(--terminal-accent);
		color: var(--bg-primary);
		box-shadow: 0 0 10px var(--terminal-accent);
	}
</style>
