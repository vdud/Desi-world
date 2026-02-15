import express from 'express';
import cors from 'cors';
import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

interface AgentProcess {
	process: ChildProcess;
	id: string;
	name: string;
	startTime: number;
	owner?: string;
}

// Store active agents
const agents = new Map<string, AgentProcess>();

// Helper to clean up dead processes
const cleanup = (id: string) => {
	if (agents.has(id)) {
		const agent = agents.get(id)!;
		console.log(`[Fleet] Agent ${agent.name} (${id}) exited.`);
		agents.delete(id);
	}
};

app.get('/agents', (req, res) => {
	const list = Array.from(agents.values()).map((a) => ({
		id: a.id,
		name: a.name,
		uptime: Date.now() - a.startTime,
		owner: a.owner
	}));
	res.json(list);
});

app.post('/agent/start', (req, res) => {
	const { id, name, purpose, behaviour, owner } = req.body;

	if (!id || !name) {
		return res.status(400).json({ error: 'Missing id or name' });
	}

	if (agents.has(id)) {
		return res.status(409).json({ error: 'Agent already running' });
	}

	// Spawn the agent process
	// We use 'npx tsx agent/main.ts'
	const env = {
		...process.env,
		AGENT_ID: id,
		AGENT_NAME: name,
		AGENT_PURPOSE: purpose || 'Explorer',
		AGENT_BEHAVIOUR: behaviour || 'Neutral',
		AGENT_OWNER: owner || '' // Pass owner wallet address
	};

	const partyHost = env.NEXT_PUBLIC_PARTYKIT_HOST || 'antigravity-server.vdud.partykit.dev';
	console.log(`[Fleet] Starting agent ${name} (Owner: ${owner || 'None'})`);
	console.log(`[Fleet] Target PartyKit Host: ${partyHost}`);

	// Use direct path to tsx to avoid npx wrapper signal issues
	const tsxPath = path.join(process.cwd(), 'node_modules', '.bin', 'tsx');

	const child = spawn(tsxPath, ['agent/main.ts'], {
		stdio: 'inherit', // Pipe logs to main container logs
		env,
		cwd: process.cwd()
		// detached: false // Ensure it's attached so signals propagate if needed, but defaults are usually fine
	});

	child.on('exit', (code, signal) => {
		console.log(`[Fleet] Agent ${name} exited with code ${code} and signal ${signal}`);
		cleanup(id);
	});

	child.on('error', (err) => {
		console.error(`[Fleet] Failed to start agent ${name}:`, err);
		cleanup(id);
	});

	agents.set(id, {
		process: child,
		id,
		name,
		startTime: Date.now(),
		owner
	});

	res.json({ success: true, pid: child.pid });
});

app.post('/agent/stop', (req, res) => {
	const { id } = req.body;

	if (!agents.has(id)) {
		return res.status(404).json({ error: 'Agent not found' });
	}

	const agent = agents.get(id)!;
	console.log(`[Fleet] Stopping agent ${agent.name} (PID: ${agent.process.pid})...`);

	// Send SIGTERM
	const killed = agent.process.kill('SIGTERM');
	console.log(`[Fleet] Kill signal sent: ${killed}`);

	// Force kill if it doesn't exit for 3 seconds
	setTimeout(() => {
		if (agents.has(id)) {
			// If still in map (cleanup removes it)
			console.log(`[Fleet] Agent ${agent.name} did not exit. Force killing (SIGKILL)...`);
			agent.process.kill('SIGKILL');
			cleanup(id);
		}
	}, 3000);

	// We optimistically remove from map or wait?
	// Better to wait for exit event to call cleanup, but for API response we return success.
	// But to avoid "duplicate" issues if start is called immediately, we might want to ensure it's gone.
	// The cleanup function removes it from the map.

	res.json({ success: true });
});

app.listen(PORT, () => {
	console.log(`🚀 Agent Fleet Manager running on port ${PORT}`);
	console.log(`[Fleet] Watching for agents...`);
});
