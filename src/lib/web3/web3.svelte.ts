import { createConfig, http } from '@wagmi/core';
import { mainnet, arbitrum, baseSepolia } from '@reown/appkit/networks';
import { browser } from '$app/environment';

// Singleton State
class Web3State {
	address = $state<string | null>(null);
	chainId = $state<number | null>(null);
	isConnected = $state(false);
	error = $state<string | null>(null);
	modal: any = null;
	config: any = null;

	constructor() {
		// Init logic here
	}

	async init(projectId: string) {
		if (!browser) return;

		try {
			// Use standard import for Svelte
			const { createAppKit } = await import('@reown/appkit');
			const { WagmiAdapter } = await import('@reown/appkit-adapter-wagmi');

			const networks = [mainnet, arbitrum, baseSepolia];
			const wagmiAdapter = new WagmiAdapter({
				networks,
				projectId,
				ssr: false
			});

			this.config = wagmiAdapter.wagmiConfig;

			this.modal = createAppKit({
				adapters: [wagmiAdapter],
				networks: networks as any,
				projectId,
				metadata: {
					name: 'root0',
					description: 'Metaverse Web App',
					url: 'https://root0.online',
					icons: ['https://root0.online/icon.png']
				},
				features: {
					analytics: false
				}
			});

			// Wagmi State Subscription (This is reliable for connection status)
			this.config.subscribe((state: any) => {
				this.address = state.connections.get(state.current)?.accounts[0] || null;
				this.chainId = state.chainId;
				this.isConnected = !!this.address;
			});
		} catch (err) {
			console.warn('Web3 Initialization Error:', err);
			this.error = 'Failed to initialize wallet. Check console (likely ad-blocker).';
		}
	}

	open() {
		if (this.modal) {
			this.modal.open();
		} else if (this.error) {
			alert(this.error);
		} else {
			console.warn('Web3 modal not initialized yet.');
		}
	}
}

export const web3 = new Web3State();
