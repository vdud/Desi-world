<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { web3 } from '$lib/web3/web3.svelte';
	import { playerName } from '$lib/stores/commonStores';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen = $bindable(), onClose }: Props = $props();

	let nameInput = $state($playerName);
	let isEditing = $state(false);

	function saveName() {
		playerName.set(nameInput);
		isEditing = false;
	}

	function startEditing() {
		nameInput = $playerName;
		isEditing = true;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			saveName();
		} else if (e.key === 'Escape') {
			isEditing = false;
			nameInput = $playerName;
		}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" transition:fade={{ duration: 200 }} onclick={onClose}>
		<div
			class="modal-content"
			transition:scale={{ start: 0.95, duration: 200 }}
			onclick={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h2>Identity Protocol</h2>
				<button class="close-btn" onclick={onClose}>×</button>
			</div>

			<div class="modal-body">
				<div class="section">
					<span class="label">DESIGNATION</span>
					{#if isEditing}
						<div class="input-group">
							<input
								type="text"
								bind:value={nameInput}
								onkeydown={(e) => {
									e.stopPropagation();
									handleKeydown(e);
								}}
								onkeyup={(e) => e.stopPropagation()}
								class="name-input"
								placeholder="Enter designation..."
								autofocus
							/>
							<button class="save-btn" onclick={saveName}>SAVE</button>
						</div>
					{:else}
						<div class="name-display">
							<span class="current-name">{$playerName}</span>
							<button class="edit-btn" onclick={startEditing}>EDIT</button>
						</div>
					{/if}
				</div>

				<div class="section">
					<span class="label">NEURAL LINK (WALLET)</span>
					<div class="wallet-display">
						<div class={`status-dot ${web3.isConnected ? 'connected' : ''}`}></div>
						<span class="wallet-address">
							{web3.isConnected ? web3.address : 'DISCONNECTED'}
						</span>
					</div>
					{#if !web3.isConnected}
						<button class="connect-btn" onclick={() => web3.open()}> INITIALIZE LINK </button>
					{/if}
				</div>
			</div>

			<div class="modal-footer">
				<span class="footer-text">ROOT0 IDENTITY SYSTEM v1.0</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(4px);
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-content {
		background: #0a0a0a;
		border: 1px solid var(--border-color);
		width: 100%;
		max-width: 400px;
		color: var(--text-primary);
		font-family: var(--font-mono);
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border-color);
		background: rgba(255, 255, 255, 0.02);
	}

	h2 {
		font-size: 0.9rem;
		margin: 0;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.close-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-size: 1.5rem;
		cursor: pointer;
		line-height: 1;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: var(--text-primary);
	}

	.modal-body {
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.label {
		font-size: 0.7rem;
		color: var(--text-secondary);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	/* Name Input/Display */
	.input-group {
		display: flex;
		gap: 0.5rem;
	}

	.name-input {
		flex: 1;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-color);
		padding: 0.75rem;
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 1rem;
		outline: none;
	}

	.name-input:focus {
		border-color: var(--terminal-accent);
	}

	.save-btn {
		background: var(--text-primary);
		color: var(--bg-primary);
		border: none;
		padding: 0 1rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		cursor: pointer;
		font-weight: 600;
	}

	.name-display {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-color);
		padding: 0.75rem;
	}

	.current-name {
		font-size: 1.1rem;
		font-weight: 500;
	}

	.edit-btn {
		background: transparent;
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.edit-btn:hover {
		border-color: var(--text-primary);
		color: var(--text-primary);
	}

	/* Wallet Display */
	.wallet-display {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(0, 0, 0, 0.3);
		padding: 0.75rem;
		border-radius: 4px;
		font-family: monospace;
		border: 1px dashed var(--border-color);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ff5f56;
		box-shadow: 0 0 5px rgba(255, 95, 86, 0.5);
	}

	.status-dot.connected {
		background: #27c93f;
		box-shadow: 0 0 5px rgba(39, 201, 63, 0.5);
	}

	.wallet-address {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.connect-btn {
		align-self: flex-start;
		background: transparent;
		border: 1px solid var(--terminal-accent);
		color: var(--terminal-accent);
		padding: 0.5rem 1rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.connect-btn:hover {
		background: rgba(39, 201, 63, 0.1);
		box-shadow: 0 0 10px rgba(39, 201, 63, 0.2);
	}

	.modal-footer {
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-top: 1px solid var(--border-color);
		display: flex;
		justify-content: flex-end;
	}

	.footer-text {
		font-size: 0.6rem;
		color: var(--text-secondary);
		opacity: 0.5;
	}
</style>
