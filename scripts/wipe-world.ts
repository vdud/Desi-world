import { HeadlessAgent } from '../src/lib/network/HeadlessAgent';

const agent = new HeadlessAgent('localhost:1999', 'main-room', 'WorldWiper');

const OBJECTS_TO_REMOVE = [
	'girl-dancing-1',
	'girl-dancing-2',
	'car-1',
	'car-2',
	'low-poly-ground-speaker'
];

// Wait for connection
setTimeout(() => {
	console.log('🧹 Wiping World Objects...');

	for (const id of OBJECTS_TO_REMOVE) {
		console.log(`- Removing ${id}`);
		agent.socket.send(
			JSON.stringify({
				type: 'object-remove',
				id: id
			})
		);
	}

	setTimeout(() => {
		console.log('✅ Wipe Complete.');
		process.exit(0);
	}, 1000);
}, 3000);
