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
	const list = Array.from(agents.values()).map(a => ({
		id: a.id,
		name: a.name,
		uptime: Date.now() - a.startTime
	}));
	res.json(list);
});

app.post('/agent/start', (req, res) => {
	const { id, name, purpose, behaviour } = req.body;

	if (!id || !name) {
		return res.status(400).json({ error: 'Missing id or name' });
	}

	if (agents.has(id)) {
		return res.status(409).json({ error: 'Agent already running' });
	}

	console.log(`[Fleet] Starting agent ${name}...`);

	// Spawn the agent process
	// We use 'npx tsx agent/main.ts'
	const env = { 
		...process.env, 
		AGENT_ID: id,
		AGENT_NAME: name,
		AGENT_PURPOSE: purpose || 'Explorer',
		AGENT_BEHAVIOUR: behaviour || 'Neutral'
	};

	const child = spawn('npx', ['tsx', 'agent/main.ts'], {
		stdio: 'inherit', // Pipe logs to main container logs
		env,
		cwd: process.cwd()
	});

	child.on('exit', () => cleanup(id));
	child.on('error', (err) => {
		console.error(`[Fleet] Failed to start agent ${name}:`, err);
		cleanup(id);
	});

	agents.set(id, {
		process: child,
		id,
		name,
		startTime: Date.now()
	});

	res.json({ success: true, pid: child.pid });
});

app.post('/agent/stop', (req, res) => {
	const { id } = req.body;

	if (!agents.has(id)) {
		return res.status(404).json({ error: 'Agent not found' });
	}

	const agent = agents.get(id)!;
	console.log(`[Fleet] Stopping agent ${agent.name}...`);
	
	agent.process.kill(); // SIGTERM
	agents.delete(id);

	res.json({ success: true });
});

app.listen(PORT, () => {
	console.log(`🚀 Agent Fleet Manager running on port ${PORT}`);
});
