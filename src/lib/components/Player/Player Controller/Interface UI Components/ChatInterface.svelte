<script lang="ts">
	import { chatTarget, isChatOpen, playerName } from '$lib/stores/commonStores';
	import { network } from '$lib/network/network.svelte';
	import { onMount } from 'svelte';

	let message = $state('');
	let inputElement: HTMLInputElement;
	let isGlobalOverride = $state(false);

	function sendMessage() {
		if (!message.trim()) return;

		// Determine target: if global override is on or no target selected, send to all.
		// Otherwise send to specific target.
		const target = (!isGlobalOverride && $chatTarget) ? $chatTarget : undefined;
		
		network.sendChatMessage(message.trim(), target ?? undefined); // We broadcast globally for now as per design

		message = '';

		// Keep focus for rapid chatting
		inputElement?.focus();
	}

	function closeChat() {
		isChatOpen.set(false);
		chatTarget.set(null);
		isGlobalOverride = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		e.stopPropagation(); // Prevent game movement
		if (e.key === 'Enter') {
			sendMessage();
		} else if (e.key === 'Escape') {
			closeChat();
		}
	}

	let targetName = $derived(
		$chatTarget ? network.otherPlayers.get($chatTarget)?.name || 'Unknown' : 'Global Chat'
	);
	
	let isDirectMode = $derived(!!$chatTarget && !isGlobalOverride);

	onMount(() => {
		if (inputElement) inputElement.focus();
	});
</script>

<div class="chat-overlay" role="dialog" aria-modal="true">
	<div class="chat-window">
		<div class="chat-header">
			<div class="header-content">
				<span class="chat-title">
					{isDirectMode ? `Chatting with ${targetName}` : 'Global Chat'}
				</span>
				{#if $chatTarget}
					<button 
						class="toggle-mode-btn" 
						onclick={() => isGlobalOverride = !isGlobalOverride}
					>
						{isGlobalOverride ? 'Switch to DM' : 'Switch to Global'}
					</button>
				{/if}
			</div>
			<button class="close-btn" onclick={closeChat}>×</button>
		</div>

		<!-- Future: Chat History could go here -->
		<div class="chat-history-placeholder">
			<p class="history-hint">
				{isDirectMode 
					? `Message will be sent only to ${targetName}.` 
					: 'Message will be seen by everyone.'}
			</p>
		</div>

		<div class="chat-input-area">
			<input
				bind:this={inputElement}
				type="text"
				bind:value={message}
				placeholder={isDirectMode ? `Message ${targetName}...` : "Message everyone..."}
				onkeydown={handleKeydown}
				onpointerdown={(e) => e.stopPropagation()}
			/>
			<button class="send-btn" onclick={sendMessage} onpointerdown={(e) => e.stopPropagation()}
				>Send</button
			>
		</div>
	</div>
</div>

<style>
	.chat-overlay {
		position: fixed;
		bottom: 120px; /* Above joystick */
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		pointer-events: auto;
	}

	.chat-window {
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		width: 350px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
	}

	.chat-header {
		background: rgba(255, 255, 255, 0.1);
		padding: 10px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.header-content {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.chat-title {
		color: white;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.toggle-mode-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 4px;
		color: white;
		font-size: 0.7rem;
		padding: 2px 6px;
		cursor: pointer;
	}
	
	.toggle-mode-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.close-btn {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.6);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
	}

	.close-btn:hover {
		color: white;
	}

	.chat-history-placeholder {
		padding: 10px;
		height: 60px; /* Small for now since we rely on bubbles */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.history-hint {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.8rem;
		text-align: center;
		margin: 0;
		font-style: italic;
	}

	.chat-input-area {
		padding: 10px;
		display: flex;
		gap: 8px;
		background: rgba(0, 0, 0, 0.3);
	}

	input {
		flex: 1;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		padding: 8px 12px;
		color: white;
		font-family: inherit;
		outline: none;
	}

	input:focus {
		border-color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.15);
	}

	.send-btn {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.send-btn:hover {
		background: #2563eb;
	}
</style>
