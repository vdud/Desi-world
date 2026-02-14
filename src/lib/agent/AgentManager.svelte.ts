import { browser } from '$app/environment';
import { network } from '$lib/network/network.svelte';

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
}

const FLEET_URL = browser && window.location.hostname === 'localhost' 
	? 'http://localhost:3000' 
	: '/api/fleet';

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
				const timeStr = new Date(timestamp).toLocaleTimeString();
				const logEntry = `[${timeStr}] ${message}`;
				
				// 1. Update World Agents (Match by SocketID)
				if (socketId) {
					if (!this.remoteLogs.has(socketId)) this.remoteLogs.set(socketId, []);
					const logs = this.remoteLogs.get(socketId)!;
					logs.push(logEntry);
					if (logs.length > 50) logs.shift();
					
					const worldIdx = this.worldAgents.findIndex(wa => wa.id === socketId);
					if (worldIdx !== -1) {
						this.worldAgents[worldIdx].logs = [...logs];
					}
				}

				// 2. Update Local Agents (Match by UUID = agentId)
				if (agentId) {
					const localIdx = this.agents.findIndex(a => a.id === agentId);
					if (localIdx !== -1) {
						const currentLogs = this.agents[localIdx].logs;
						if (currentLogs.length > 50) currentLogs.shift();
						this.agents[localIdx].logs = [...currentLogs, logEntry];
					}
				}
			});
		}
	}

	private async syncWithFleet() {
		try {
			const res = await fetch(`${FLEET_URL}/agents`);
			if (res.ok) {
				const runningAgents = await res.json();
				// runningAgents is [{ id, name, uptime }]
				
				// Update local status
				this.agents.forEach(agent => {
					const isRunning = runningAgents.some((ra: any) => ra.id === agent.id);
					agent.status = isRunning ? 'running' : 'stopped';
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
					
					discovered.push({
						id,
						name: p.name || 'Unknown Agent',
						position: { x: p.x, y: p.y, z: p.z },
						isLocal: false, // We can't easily know if it's "ours" without ID matching
						purpose: (p as any).agentPurpose,
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
			id: crypto.randomUUID(),
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
					behaviour: agent.behaviour
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
		if (agentIndex === -1) return;

		try {
			await fetch(`${FLEET_URL}/agent/stop`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			
			this.agents[agentIndex].status = 'stopped';
			this.addLog(id, '🛑 Stop command sent to Fleet.');
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