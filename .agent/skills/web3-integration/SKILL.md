---
description: Integration guide for Web3 wallets using Reown AppKit (formerly WalletConnect) with Svelte 5 Runes.
---

# Web3 Integration Skill (Reown AppKit + Svelte 5)

This skill provides the standard way to integrate Crypto Wallets into the Antigravity project.

## 1. Technology Stack

- **Library**: `@reown/appkit` (formerly Web3Modal)
- **Adapter**: `@reown/appkit-adapter-wagmi` (for EVM compatibility)
- **Core**: `@wagmi/core` & `viem`
- **State Management**: Svelte 5 Runes (`$state`)

## 2. Setup

### Installation

```bash
pnpm add @reown/appkit @reown/appkit-adapter-wagmi @wagmi/core viem
```

### Environment Variables

You must have a `VITE_REOWN_PROJECT_ID` in your `.env` file.
Get one from [cloud.reown.com](https://cloud.reown.com).

## 3. Architecture

Do NOT use the default React hooks or Svelte 4 stores. We wrap the Web3 logic in a Rune-based singleton.

### `src/lib/web3/web3.svelte.ts`

```typescript
import { createConfig, http } from '@wagmi/core';
import { mainnet, arbitrum } from '@reown/appkit/networks';

// Singleton State
class Web3State {
	address = $state<string | null>(null);
	chainId = $state<number | null>(null);
	isConnected = $state(false);
	modal: any = null;

	constructor() {
		// Init logic here
	}

	async init(projectId: string) {
		// Dynamic import to avoid SSR errors
		const { createAppKit } = await import('@reown/appkit/react');
		const { WagmiAdapter } = await import('@reown/appkit-adapter-wagmi');

		// Setup Wagmi Adapter
		const networks = [mainnet, arbitrum];
		const wagmiAdapter = new WagmiAdapter({
			networks,
			projectId,
			ssr: false
		});

		// Create Modal
		this.modal = createAppKit({
			adapters: [wagmiAdapter],
			networks,
			projectId,
			metadata: {
				name: 'Antigravity',
				description: 'Metaverse Web App',
				url: 'https://antigravity.game',
				icons: ['https://antigravity.game/icon.png']
			}
		});

		// Listen for updates (pseudo-code, depends on specific event API)
		this.modal.subscribeEvents((newState) => {
			this.isConnected = newState.open; // Check actual API for connection state
		});

		// Polling or event listeners for account changes via Wagmi core
	}

	open() {
		this.modal?.open();
	}
}

export const web3 = new Web3State();
```

## 4. Component Usage

```svelte
<script lang="ts">
	import { web3 } from '$lib/web3/web3.svelte';
</script>

{#if web3.isConnected}
	<p>Connected: {web3.address}</p>
{:else}
	<button onclick={() => web3.open()}>Connect Wallet</button>
{/if}
```

## 5. Rules

1. **Client-Side Only**: Ensure initialization only happens in `onMount` or within a browser check `if (browser)`.
2. **Reactivity**: Map the imperative event listeners from Wagmi/Reown to `$state` properties so the UI reacts automatically.
3. **No Legacy**: Do not use `svelte-wagmi` or older generic wrappers. Use the official Reown libraries directly.
