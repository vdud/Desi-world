import puppeteer from 'puppeteer';

// Configuration
const GAME_URL = 'https://localhost:5173/play';
const API_KEY = 'ROOT0-6X6Y2L3GJ01BMIEV'; // You can generate a real one on the landing page
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure this is set in your environment

/**
 * The "Brain" of the Agent.
 * This function simulates (or performs) the call to Gemini.
 */
async function askGemini(observation) {
	console.log(`🧠 Mental State: Analyzing ${observation.nearbyEntities.length} entities...`);

	// --- REAL GEMINI INTEGRATION (Uncomment when you have the SDK) ---
	/*
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    You are an AI agent in a 3D metaverse.
    Your current state: ${JSON.stringify(observation)}
    
    Decide your next move. Return JSON only:
    { "type": "move", "payload": { "forward": 0.5 } }
    OR
    { "type": "look", "payload": { "rotation": 1.5 } }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text); // Ensure your prompt enforces JSON output
    */

	// --- SIMULATED LOGIC (Random Walk) ---
	return new Promise((resolve) => {
		setTimeout(() => {
			const actions = [
				{ type: 'move', payload: { forward: Math.random() } },
				{ type: 'look', payload: { rotation: Math.random() * 6 } },
				{ type: 'move', payload: { forward: 0 } }, // Stop
				{
					type: 'chat',
					payload: {
						text: ['Hello human!', 'Analyzing...', 'I am alive.', 'Nice pixels.'][
							Math.floor(Math.random() * 4)
						]
					}
				}
			];
			const decision = actions[Math.floor(Math.random() * actions.length)];
			resolve(decision);
		}, 1000); // "Think" for 1 second
	});
}

(async () => {
	console.log('🚀 Launching Gemini Agent Body...');

	// 1. Launch the Browser (Visible Mode)
	// Try to find system Chrome if Puppeteer's Chrome is missing
	const launchConfig = {
		headless: false,
		defaultViewport: null,
		args: [
			'--start-maximized',
			'--ignore-certificate-errors' // Trusted self-signed certs
		]
	};

	let browser;
	try {
		// Try default launch
		browser = await puppeteer.launch(launchConfig);
	} catch (e) {
		// Fallback to system chrome
		console.log('⚠️ Bundled Chrome not found, trying system Chrome...');
		launchConfig.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
		browser = await puppeteer.launch(launchConfig); // Try again with executablePath
	}

	const page = await browser.newPage();

	// 2. Navigate to the Neural Lattice
	console.log(`🌐 Navigating to ${GAME_URL}...`);
	await page.goto(GAME_URL);

	// 3. Inject Protocol & Connect
	console.log('🔌 Connecting to root0 Protocol...');

	// Wait for the game to initialize
	await page.waitForFunction(() => window.root0 !== undefined, { timeout: 30000 });

	const connected = await page.evaluate(async (key) => {
		return await window.root0.agent.connect(key);
	}, API_KEY);

	if (connected) {
		console.log('🟢 CONNECTION ESTABLISHED. Agent is online.');
	} else {
		console.error('🔴 Connection failed.');
		await browser.close();
		return;
	}

	// 4. The Life Loop (Perceive -> Think -> Act)
	console.log('🧠 Starting Cognitive Loop...');

	while (true) {
		try {
			// A. OBSERVE
			const observation = await page.evaluate(() => {
				return window.root0.agent.observe();
			});

			// B. THINK (Call Gemini)
			const action = await askGemini(observation);
			console.log(`⚡ Action: ${action.type}`, action.payload);

			// C. ACT
			await page.evaluate((cmd) => {
				window.root0.agent.send(cmd);
			}, action);
		} catch (error) {
			console.error('❌ Error in cognitive loop:', error);
		}
	}
})();
