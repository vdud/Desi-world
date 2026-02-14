import { HeadlessAgent } from '../src/lib/network/HeadlessAgent.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const agent = new HeadlessAgent('localhost:1999', 'main-room');

const server = new Server(
	{
		name: 'root0-game-server',
		version: '0.1.0'
	},
	{
		capabilities: {
			resources: {},
			tools: {}
		}
	}
);

// Tools
const MoveAgentSchema = z.object({
	x: z.number().describe('X coordinate to move to'),
	z: z.number().describe('Z coordinate to move to')
});

const SpeakSchema = z.object({
	message: z.number().or(z.string()).describe('Message to say in chat')
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: 'move_agent',
				description: 'Move the agent to a specific coordinate (x, z). Y is handled automatically.',
				inputSchema: {
					type: 'object',
					properties: {
						x: { type: 'number', description: 'X coordinate' },
						z: { type: 'number', description: 'Z coordinate' }
					},
					required: ['x', 'z']
				}
			},
			{
				name: 'speak',
				description: 'Say something in the global chat.',
				inputSchema: {
					type: 'object',
					properties: {
						message: { type: 'string', description: 'The message content' }
					},
					required: ['message']
				}
			},
			{
				name: 'get_nearby_players',
				description: 'Get a list of nearby players and their distances.',
				inputSchema: {
					type: 'object',
					properties: {}
				}
			}
		]
	};
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	try {
		if (request.params.name === 'move_agent') {
			const args = MoveAgentSchema.safeParse(request.params.arguments);
			if (!args.success) {
				throw new Error('Invalid arguments for move_agent');
			}
			agent.moveTo(args.data.x, args.data.z);
			return {
				content: [{ type: 'text', text: `Moved to ${args.data.x}, ${args.data.z}` }]
			};
		} else if (request.params.name === 'speak') {
			const args = SpeakSchema.safeParse(request.params.arguments);
			if (!args.success) {
				throw new Error('Invalid arguments for speak');
			}
			agent.say(String(args.data.message));
			return {
				content: [{ type: 'text', text: `Said: ${args.data.message}` }]
			};
		} else if (request.params.name === 'get_nearby_players') {
			const observation = agent.getObservation();
			return {
				content: [{ type: 'text', text: JSON.stringify(observation.nearbyEntities, null, 2) }]
			};
		} else {
			throw new Error('Unknown tool');
		}
	} catch (err: any) {
		return {
			content: [{ type: 'text', text: `Error: ${err.message}` }],
			isError: true
		};
	}
});

// Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
	return {
		resources: [
			{
				uri: 'game://state',
				name: 'Game State',
				mimeType: 'application/json',
				description: 'Current state of the agent and world'
			}
		]
	};
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
	if (request.params.uri === 'game://state') {
		return {
			contents: [
				{
					uri: 'game://state',
					mimeType: 'application/json',
					text: JSON.stringify(agent.getObservation(), null, 2)
				}
			]
		};
	}
	throw new Error('Resource not found');
});

async function runServer() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error('MCP Server running on stdio');
}

runServer().catch((error) => {
	console.error('Fatal error in main loop:', error);
	process.exit(1);
});
