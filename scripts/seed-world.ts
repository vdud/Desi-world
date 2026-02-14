import { HeadlessAgent } from '../src/lib/network/HeadlessAgent';

const agent = new HeadlessAgent('localhost:1999', 'main-room', 'WorldSeeder');

const INITIAL_OBJECTS = [
	{
		id: 'girl-dancing-1',
		x: 5,
		z: 5,
		radius: 1.0,
		type: 'npc',
		color: 'unknown',
		description: 'A dancing girl avatar.'
	},
	{
		id: 'girl-dancing-2',
		x: -2.4,
		z: -8,
		radius: 1.0,
		type: 'npc',
		color: 'unknown',
		description: 'Another dancing girl avatar.'
	},
	{
		id: 'car-1',
		x: 10,
		z: -5,
		radius: 2.5,
		type: 'vehicle',
		color: 'yellow',
		description: 'A sleek yellow sports car.'
	},
	{
		id: 'low-poly-ground-speaker',
		x: -10,
		z: -5,
		radius: 1.0,
		type: 'furniture',
		color: 'black',
		description: 'A large ground speaker playing music.'
	}
];

// Wait for connection
setTimeout(() => {
	console.log('🌱 Seeding World Objects...');

	for (const obj of INITIAL_OBJECTS) {
		console.log(`+ Placing ${obj.id} at (${obj.x}, ${obj.z}) (State: ${agent.socket.readyState})`);
		if (agent.socket) {
			agent.socket.send(
				JSON.stringify({
					type: 'object-place',
					object: obj
				})
			);
		}
	}

	setTimeout(() => {
		console.log('✅ Seeding Complete. Staying connected for 60s...');
		// agent.stopLoop();
		// process.exit(0);
	}, 1000);
}, 3000); // Give it 3s to connect
