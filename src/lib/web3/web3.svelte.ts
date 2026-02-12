import type { AppKitNetwork } from '@reown/appkit/networks';
import { mainnet, arbitrum, base } from '@reown/appkit/networks';
import { getAccount, watchAccount, disconnect, type Config, reconnect } from '@wagmi/core';
import { browser } from '$app/environment';

// Project ID form env
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

if (!projectId) {
	console.warn('VITE_REOWN_PROJECT_ID is not set in .env');
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, base];

class Web3Manager {
	// Reactive State (Runes)
	address = $state<string | null>(null);
	chainId = $state<number | null>(null);
	isConnected = $state(false);
	isInitialized = $state(false);

	// Internal
	private modal: any = null;
	private wagmiAdapter: any = null;

	constructor() {
		if (browser) {
			this.init();
		}
	}

	async init() {
		if (this.isInitialized || !projectId) return;

		try {
			// Dynamic import to avoid SSR issues with walletconnect deps
			const { createAppKit } = await import('@reown/appkit');
			const { WagmiAdapter } = await import('@reown/appkit-adapter-wagmi');

			// 1. Create Wagmi Adapter
			this.wagmiAdapter = new WagmiAdapter({
				networks,
				projectId,
				ssr: false // We are doing client-side init
			});

			// 2. Create Modal
			this.modal = createAppKit({
				adapters: [this.wagmiAdapter],
				networks,
				projectId,
				metadata: {
					name: 'root0',
					description: 'The Metaverse is Here',
					url: 'https://root0.online',
					icons: ['https://root0.online/icon.png']
				},
				features: {
					analytics: true
				}
			});

			// 3. Sync State (Initial)
			this.syncState();

			// 4. Watch for Changes (Event Listener)
			watchAccount(this.wagmiAdapter.wagmiConfig as Config, {
				onChange: (account) => {
					this.address = account.address || null;
					this.chainId = account.chainId || null;
					this.isConnected = account.isConnected;
				}
			});

			// Attempt reconnect if possible (handled by wagmi usually, but explicit call helps debug)
			if (this.wagmiAdapter) reconnect(this.wagmiAdapter.wagmiConfig as Config);

			this.isInitialized = true;
			console.log('Web3Manager Initialized');
		} catch (error) {
			console.error('Failed to initialize Web3Manager:', error);
		}
	}

	private syncState() {
		if (!this.wagmiAdapter) return;
		const account = getAccount(this.wagmiAdapter.wagmiConfig as Config);
		this.address = account.address || null;
		this.chainId = account.chainId || null;
		this.isConnected = account.isConnected;
	}

	open() {
		this.modal?.open();
	}

	async disconnect() {
		if (this.wagmiAdapter) {
			await disconnect(this.wagmiAdapter.wagmiConfig as Config);
		}
	}
}

// Singleton Export
export const web3 = new Web3Manager();
