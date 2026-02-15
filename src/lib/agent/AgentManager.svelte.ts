import { browser } from '$app/environment';
import { network } from '$lib/network/network.svelte';
import { web3 } from '$lib/web3/web3.svelte';

export interface AgentConfig {
	id: string;
	name: string;
	purpose: string;
	behaviour: string;
	status: 'stopped' | 'running';
	logs: string[];
}

export interface WorldAgent {
	id: string;
	name: string;
	position: { x: number; y: number; z: number };
	isLocal: boolean;
	purpose?: string;
	logs: string[];
	owner?: string;
}

const FLEET_URL = '/api/fleet';

class AgentManagerState {
	agents = $state<AgentConfig[]>([]);
	worldAgents = $state<WorldAgent[]>([]);

	// Cache for logs of remote agents
	private remoteLogs: Map<string, string[]> = new Map();

	constructor() {
		if (browser) {
			this.loadFromStorage();
			this.syncWithFleet(); // Restore state from server
			this.startDiscovery();

			// Listen for remote logs
			window.addEventListener('agent-debug-log', (e: any) => {
				const { agentId, socketId, message, timestamp } = e.detail;
				
				// DEBUG: See if logs are arriving in the browser console at all
				console.log(`[AgentLog] Received: ${agentId} | Msg: ${message}`);

				const timeStr = new Date(timestamp).toLocaleTimeString();
				const logEntry = `[${timeStr}] ${message}`;

				// 1. Update World Agents (Match by SocketID)
				if (socketId) {
					if (!this.remoteLogs.has(socketId)) this.remoteLogs.set(socketId, []);
					const logs = this.remoteLogs.get(socketId)!;
					logs.push(logEntry);
					if (logs.length > 50) logs.shift();

					const worldIdx = this.worldAgents.findIndex((wa) => wa.id === socketId);
					if (worldIdx !== -1) {
						// Create a new object for reactivity
						this.worldAgents[worldIdx] = {
							...this.worldAgents[worldIdx],
							logs: [...logs]
						};
					}
				}

				// 2. Update Local Agents (Match by UUID = agentId)
				if (agentId) {
					const localIdx = this.agents.findIndex((a) => a.id === agentId);
					if (localIdx !== -1) {
						const currentLogs = this.agents[localIdx].logs;
						const updatedLogs = [...currentLogs, logEntry].slice(-50);
						
						// FORCE REACTIVITY: Update the array reference and the object reference
						const updatedAgent = { ...this.agents[localIdx], logs: updatedLogs };
						const newAgents = [...this.agents];
						newAgents[localIdx] = updatedAgent;
						this.agents = newAgents;
						
						console.log(`[AgentLog] Updated Local Agent: ${updatedAgent.name} (Logs: ${updatedLogs.length})`);
					} else {
						console.warn(`[AgentLog] Received log for UNKNOWN agent ID: ${agentId}`);
					}
				}
			});
		}
	}

	private async syncWithFleet() {
		try {
			const res = await fetch(`${FLEET_URL}/agents`);
			if (res.ok) {
				const runningAgents: any[] = await res.json();
				// runningAgents is [{ id, name, uptime, owner? }]

				const myAddress = web3.address?.toLowerCase();

				// 1. Update status of known agents
				this.agents.forEach((agent) => {
					const remote = runningAgents.find((ra) => ra.id === agent.id);
					agent.status = remote ? 'running' : 'stopped';
				});

				// 2. Manage Orphan/Unknown Agents
				runningAgents.forEach((ra) => {
					// Rule: If owner is unknown, DELETE THEM.
					if (!ra.owner) {
						console.warn(`[AgentManager] Found agent ${ra.name} with NO OWNER. Terminating...`);
						this.stopAgent(ra.id); // This will now work even if not in local list
						return;
					}

					// 3. Adopt agents owned by me matches
					if (myAddress && ra.owner.toLowerCase() === myAddress) {
						const exists = this.agents.some((a) => a.id === ra.id);
						if (!exists) {
							console.log(`[AgentManager] Adopting orphan agent: ${ra.name}`);
							// We don't have the full config from fleet (purpose/behaviour are not returned yet, but we can default or fetch if we improved fleet API further)
							// For now, we add them with basic info so they appear in the dashboard.
							this.addAgent({
								id: ra.id,
								name: ra.name,
								purpose: 'Recovered from Fleet', // Placeholder as fleet doesn't return this yet
								behaviour: 'Neutral',
								status: 'running',
								logs: []
							});
						}
					}
				});
			}
		} catch (e) {
			console.warn('Could not sync with Fleet Manager (is it running?)');
		}
	}

	private startDiscovery() {
		setInterval(() => {
			if (!network || !network.otherPlayers) return;

			const discovered: WorldAgent[] = [];

			network.otherPlayers.forEach((p, id) => {
				if (p.isAgent) {
					const logs = this.remoteLogs.get(id) || [];
					const agentOwner = (p as any).walletAddress?.toLowerCase();
					const myAddress = web3.address?.toLowerCase();

					discovered.push({
						id,
						name: p.name || 'Unknown Agent',
						position: { x: p.x, y: p.y, z: p.z },
						isLocal: !!(agentOwner && myAddress && agentOwner === myAddress),
						purpose: (p as any).agentPurpose,
						owner: agentOwner || 'Unknown',
						logs: logs
					});
				}
			});

			this.worldAgents = discovered;
		}, 2000);
	}

	private loadFromStorage() {
		const stored = localStorage.getItem('root0_my_agents');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				this.agents = parsed.map((a: AgentConfig) => ({ ...a, status: 'stopped', logs: [] }));
			} catch (e) {
				console.error('Failed to load agents', e);
			}
		} else {
			this.addAgent({
				name: 'Bunty',
				purpose: 'To be a Guide',
				behaviour: 'Rude yet sarcastic'
			});
		}
	}

	private saveToStorage() {
		if (!browser) return;
		const toSave = this.agents.map(({ id, name, purpose, behaviour }) => ({
			id,
			name,
			purpose,
			behaviour
		}));
		localStorage.setItem('root0_my_agents', JSON.stringify(toSave));
	}

	addAgent(config: Partial<AgentConfig>) {
		const newAgent: AgentConfig = {
			id: config.id || crypto.randomUUID(),
			name: config.name || 'New Agent',
			purpose: config.purpose || 'To explore',
			behaviour: config.behaviour || 'Neutral',
			status: 'stopped',
			logs: []
		};
		this.agents = [...this.agents, newAgent];
		this.saveToStorage();
	}

	removeAgent(id: string) {
		this.stopAgent(id);
		this.agents = this.agents.filter((a) => a.id !== id);
		this.saveToStorage();
	}

	async startAgent(id: string) {
		const agentIndex = this.agents.findIndex((a) => a.id === id);
		if (agentIndex === -1) return;
		const agent = this.agents[agentIndex];

		try {
			const res = await fetch(`${FLEET_URL}/agent/start`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: agent.id,
					name: agent.name,
					purpose: agent.purpose,
					behaviour: agent.behaviour,
					owner: web3.address // Pass the current wallet address as owner
				})
			});

			if (res.ok) {
				this.agents[agentIndex].status = 'running';
				this.addLog(id, '🚀 Launch command sent to Fleet.');
			} else {
				const err = await res.json();
				this.addLog(id, `❌ Failed to start: ${err.error}`);
			}
		} catch (e) {
			this.addLog(id, `❌ Network error connecting to Fleet.`);
		}
	}

	async stopAgent(id: string) {
		const agentIndex = this.agents.findIndex((a) => a.id === id);
		// Note: We might be stopping an orphan agent not in our list, so continue even if index is -1

		try {
			await fetch(`${FLEET_URL}/agent/stop`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});

			if (agentIndex !== -1) {
				this.agents[agentIndex].status = 'stopped';
				this.addLog(id, '🛑 Stop command sent to Fleet.');
			} else {
				console.log(`[AgentManager] Stopped remote/orphan agent ${id}`);
			}
		} catch (e) {
			console.error('Stop error', e);
		}
	}

	addLog(id: string, msg: string) {
		const agentIndex = this.agents.findIndex((a) => a.id === id);
		if (agentIndex !== -1) {
			const timestamp = new Date().toLocaleTimeString();
			const logEntry = `[${timestamp}] ${msg}`;
			const currentLogs = this.agents[agentIndex].logs;
			if (currentLogs.length > 50) currentLogs.shift();
			this.agents[agentIndex].logs = [...currentLogs, logEntry];
		}
	}
}

export const agentManager = new AgentManagerState();
