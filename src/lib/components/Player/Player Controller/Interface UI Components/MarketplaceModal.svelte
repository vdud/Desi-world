<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Minting from '$lib/components/ui/Minting.svelte';
	import { economy, type Item, type Listing } from '$lib/game/economy.svelte.ts';
	import { web3 } from '$lib/web3/web3.svelte';
	import { playerPosition, navigationTarget } from '$lib/stores/commonStores';

	interface Props {
		showMarket: boolean;
	}

	let { showMarket = $bindable() }: Props = $props();

	// --- UI State ---
	let activeTab = $state<'market' | 'inventory'>('market');
	let selectedCategory = $state<'all' | 'weapon' | 'armor'>('all');

	// Sell Modal
	let showSellModal = $state(false);
	let selectedItemToSell = $state<Item | null>(null);
	let sellPrice = $state('');

	// --- Derived Data ---
	let marketItems = $derived(
		economy.marketListings.filter((l) => l.active)
		// No need to map and lookup item anymore, it's inside 'l'
		// .map((l) => {
		// 	const item = economy.items.find((i) => i.id === l.itemId);
		// 	return { ...l, item };
		// })
		// .filter((l) => l.item)
	);

	let myInventory = $derived(economy.items.filter((i) => i.owner === web3.address));

	// --- Actions ---
	function handleBuy(listingWithItem: any) {
		if (listingWithItem.seller === web3.address) {
			alert("You can't buy your own item (but you can cancel it!)");
			return;
		}
		economy.buyItem(listingWithItem.id);
	}

	function openSellModal(item: Item) {
		selectedItemToSell = item;
		sellPrice = '';
		showSellModal = true;
	}

	function handleList() {
		if (!selectedItemToSell || !sellPrice) return;

		// Capture current location
		const location = $playerPosition
			? { x: $playerPosition.x, y: $playerPosition.y, z: $playerPosition.z }
			: undefined;

		economy.listItem(selectedItemToSell.id, sellPrice, location);
		showSellModal = false;
		selectedItemToSell = null;
		activeTab = 'market'; // Switch back to market to see listing
	}

	function handleCancel(listingId: string) {
		economy.cancelListing(listingId);
	}

	function handleNavigation(location: { x: number; y: number; z: number }) {
		navigationTarget.set(location);
		// Optionally close modal or give feedback
		// showMarket = false;
	}
</script>

<!-- Main Marketplace Modal -->
{#if showMarket}
	<div
		class="market-backdrop"
		transition:fade={{ duration: 150 }}
		onclick={() => (showMarket = false)}
		onpointerdown={(e) => e.stopPropagation()}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="market-container"
			transition:fly={{ y: -20, duration: 300 }}
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="market-header">
				<div class="header-left">
					<h2>Marketplace</h2>
					<div class="status-indicator">
						<span class="status-dot"></span>
						<span class="status-text">Live {web3.isConnected ? 'Connected' : 'Offline'}</span>
					</div>
				</div>

				<!-- Tabs -->
				<div class="header-tabs">
					<button
						class="tab-btn {activeTab === 'market' ? 'active' : ''}"
						onclick={() => (activeTab = 'market')}
					>
						Global Market
					</button>
					<button
						class="tab-btn {activeTab === 'inventory' ? 'active' : ''}"
						onclick={() => (activeTab = 'inventory')}
					>
						My Inventory ({myInventory.length})
					</button>
				</div>

				<button class="close-btn" onclick={() => (showMarket = false)}>×</button>
			</div>

			<!-- Body -->
			<div class="market-body">
				<!-- Sidebar -->
				<aside class="market-sidebar">
					<Minting />

					<div class="filter-section">
						<h3 class="filter-title">Filters</h3>
						<div class="filter-list">
							<button
								class="filter-btn {selectedCategory === 'all' ? 'active' : ''}"
								onclick={() => (selectedCategory = 'all')}
							>
								All Items
							</button>
							<button
								class="filter-btn {selectedCategory === 'weapon' ? 'active' : ''}"
								onclick={() => (selectedCategory = 'weapon')}
							>
								Weapons
							</button>
							<button
								class="filter-btn {selectedCategory === 'armor' ? 'active' : ''}"
								onclick={() => (selectedCategory = 'armor')}
							>
								Armor
							</button>
						</div>
					</div>
				</aside>

				<!-- Content Grid -->
				<div class="market-content">
					{#if activeTab === 'market'}
						<!-- MARKET LISTINGS -->
						<div class="market-grid">
							{#each marketItems as listing}
								{#if selectedCategory === 'all' || listing.item?.type === selectedCategory}
									<div class="market-card">
										<!-- Image -->
										<div class="card-image rarity-{listing.item?.rarity}">
											<span class="item-emoji">{listing.item?.image}</span>
											{#if listing.seller === web3.address}
												<span class="badge owner">YOU</span>
											{/if}
										</div>

										<!-- Info -->
										<div class="card-info">
											<h3 class="item-name">{listing.item?.name}</h3>
											<p class="item-type">{listing.item?.type} • {listing.item?.rarity}</p>

											<div class="card-footer">
												<span class="item-price">{listing.price} ROOT</span>
												{#if listing.seller === web3.address}
													<button class="action-btn cancel" onclick={() => handleCancel(listing.id)}
														>Cancel</button
													>
												{:else}
													<div class="buyer-actions">
														{#if listing.location}
															<button
																class="teleport-btn"
																title="Navigate to Seller"
																onclick={() => handleNavigation(listing.location!)}
															>
																🧭
															</button>
														{/if}
														<button class="action-btn buy" onclick={() => handleBuy(listing)}
															>Buy</button
														>
													</div>
												{/if}
											</div>
										</div>
									</div>
								{/if}
							{/each}

							{#if marketItems.length === 0}
								<div class="empty-state">No active listings found.</div>
							{/if}
						</div>
					{:else}
						<!-- INVENTORY -->
						<div class="market-grid">
							{#each myInventory as item}
								{#if selectedCategory === 'all' || item.type === selectedCategory}
									<div class="market-card">
										<div class="card-image rarity-{item.rarity}">
											<span class="item-emoji">{item.image}</span>
										</div>
										<div class="card-info">
											<h3 class="item-name">{item.name}</h3>
											<p class="item-type">{item.type} • {item.rarity}</p>
											<div class="card-footer">
												<span class="item-price">Not Listed</span>
												<button class="action-btn sell" onclick={() => openSellModal(item)}
													>List for Sale</button
												>
											</div>
										</div>
									</div>
								{/if}
							{/each}

							{#if myInventory.length === 0}
								<div class="empty-state">You have no items. Mint some!</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Sell Modal Overlay -->
	{#if showSellModal && selectedItemToSell}
		<div class="modal-backdrop" transition:fade={{ duration: 100 }}>
			<div class="modal-box">
				<h3>List Item for Sale</h3>
				<p>Setting price for: <strong>{selectedItemToSell.name}</strong></p>

				<div class="input-group">
					<input type="number" bind:value={sellPrice} placeholder="Price in ROOT" min="1" />
					<span>ROOT</span>
				</div>

				<div class="modal-actions">
					<button onclick={() => (showSellModal = false)}>Cancel</button>
					<button class="primary" onclick={handleList}>Confirm Listing</button>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	/* --- Marketplace Styles --- */
	.market-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		z-index: 200;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: auto;
	}

	.market-container {
		width: 90vw;
		max-width: 1000px;
		height: 85vh;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
	}

	.market-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 24px;
		border-bottom: 1px solid var(--border-color);
		background: rgba(255, 255, 255, 0.02);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.market-header h2 {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.header-tabs {
		display: flex;
		gap: 8px;
		background: rgba(0, 0, 0, 0.2);
		padding: 4px;
		border-radius: 8px;
	}

	.tab-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		padding: 6px 16px;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab-btn.active {
		background: var(--terminal-accent);
		color: #000;
		font-weight: 600;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-size: 1.5rem;
		cursor: pointer;
		line-height: 1;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--terminal-accent);
		box-shadow: 0 0 8px var(--terminal-accent);
		animation: pulse 2s infinite;
	}

	.status-text {
		font-size: 0.7rem;
		text-transform: uppercase;
		color: var(--text-secondary);
		font-family: var(--font-mono);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.market-body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.market-sidebar {
		width: 240px;
		border-right: 1px solid var(--border-color);
		background: rgba(0, 0, 0, 0.2);
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.filter-title {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		margin-bottom: 12px;
		letter-spacing: 0.05em;
	}

	.filter-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.filter-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		text-align: left;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.filter-btn:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	.filter-btn.active {
		color: var(--terminal-accent);
		background: rgba(74, 246, 38, 0.05);
		border: 1px solid var(--terminal-accent);
	}

	.market-content {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
	}

	.market-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 16px;
	}

	.market-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: all 0.2s ease;
	}

	.market-card:hover {
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}

	.card-image {
		height: 140px;
		background: #050505;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid var(--border-color);
		position: relative;
	}

	/* Rarity Colors */
	.card-image.rarity-common {
		border-bottom-color: #888;
	}
	.card-image.rarity-uncommon {
		border-bottom-color: #2ecc71;
	}
	.card-image.rarity-rare {
		border-bottom-color: #3498db;
	}
	.card-image.rarity-legendary {
		border-bottom-color: #f1c40f;
		box-shadow: inset 0 0 20px rgba(241, 196, 15, 0.2);
	}

	.item-emoji {
		font-size: 3rem;
		filter: grayscale(100%) opacity(0.7);
		transition: all 0.3s ease;
	}

	.badge.owner {
		position: absolute;
		top: 8px;
		right: 8px;
		background: var(--terminal-accent);
		color: #000;
		font-size: 0.6rem;
		font-weight: bold;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.market-card:hover .item-emoji {
		filter: grayscale(0%) opacity(1);
		transform: scale(1.1);
	}

	.card-info {
		padding: 16px;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.item-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 4px;
	}

	.item-type {
		font-size: 0.7rem;
		color: var(--text-secondary);
		margin-bottom: 12px;
		font-family: var(--font-mono);
		text-transform: capitalize;
	}

	.card-footer {
		margin-top: auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item-price {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--terminal-accent);
		font-weight: 600;
	}

	.action-btn {
		background: transparent;
		border: 1px solid var(--text-primary);
		color: var(--text-primary);
		padding: 4px 12px;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-btn.buy:hover {
		background: var(--terminal-accent);
		color: #000;
		border-color: var(--terminal-accent);
	}

	.action-btn.sell:hover {
		background: #3498db;
		color: #fff;
		border-color: #3498db;
	}

	.action-btn.cancel:hover {
		background: #e74c3c;
		color: #fff;
		border-color: #e74c3c;
	}

	.buyer-actions {
		display: flex;
		gap: 8px;
	}

	.action-btn.location {
		padding: 4px 8px;
		font-size: 0.8rem;
	}

	.action-btn.location:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: #fff;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--text-secondary);
		padding: 40px;
		font-family: var(--font-mono);
	}

	/* Modal Box for Selling */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		z-index: 300;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-box {
		background: #111;
		border: 1px solid var(--terminal-accent);
		padding: 24px;
		border-radius: 12px;
		width: 300px;
		box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
	}

	.modal-box h3 {
		margin-top: 0;
		color: var(--terminal-accent);
		font-family: var(--font-mono);
	}

	.input-group {
		display: flex;
		gap: 8px;
		margin: 16px 0;
	}

	.input-group input {
		flex: 1;
		background: #222;
		border: 1px solid #444;
		color: #fff;
		padding: 8px;
		border-radius: 4px;
		font-family: var(--font-mono);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
	}

	.modal-actions button {
		background: transparent;
		border: 1px solid #444;
		color: #888;
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
	}

	.modal-actions button.primary {
		border-color: var(--terminal-accent);
		color: var(--terminal-accent);
	}

	.modal-actions button.primary:hover {
		background: var(--terminal-accent);
		color: #000;
	}

	/* Scrollbar */
	.market-content::-webkit-scrollbar {
		width: 4px;
	}
	.market-content::-webkit-scrollbar-track {
		background: transparent;
	}
	.market-content::-webkit-scrollbar-thumb {
		background: var(--border-color);
		border-radius: 2px;
	}
</style>
