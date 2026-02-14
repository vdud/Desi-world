import { HeadlessAgent } from '../src/lib/network/HeadlessAgent';

async function testAgent() {
	console.log('🧪 Testing Headless Agent...');
	const agent = new HeadlessAgent('localhost:1999', 'main-room');

	// Give it time to connect
	await new Promise((resolve) => setTimeout(resolve, 2000));

	console.log('📍 Moving Agent...');
	agent.moveTo(5, 5);

	await new Promise((resolve) => setTimeout(resolve, 1000));

	console.log('💬 Agent Speaking...');
	agent.say('Hello from the Test Script!');

	await new Promise((resolve) => setTimeout(resolve, 2000));

	const obs = agent.getObservation();
	console.log('👀 Observation:', obs);

	console.log('✅ Test Complete');
	process.exit(0);
}

testAgent();
