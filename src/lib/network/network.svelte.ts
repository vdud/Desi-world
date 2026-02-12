import PartySocket from 'partysocket';

export type PlayerState = {
	id: string;
	x: number;
	y: number;
	z: number;
	rotation: number; // Y rotation
	movement: { forward: number; backward: number; left: number; right: number; up: number };
	grounded: boolean;
	character: string;
	color: string;
	metalness: number;
	roughness: number;
	isAgent?: boolean;
};

import type {
	AgentInterface,
	AgentCommand,
	AgentObservation,
	AgentSelfState
} from './AgentProtocol';

export class NetworkManager implements AgentInterface {
	socket: PartySocket;
	otherPlayers = $state(new Map<string, PlayerState>());
	voiceStreams = $state(new Map<string, MediaStream>());
	serverStartTime = $state(0);

	myId = $state<string>('');
	myStream: MediaStream | null = null;
	peers = new Map<string, RTCPeerConnection>();
	iceQueues = new Map<string, RTCIceCandidate[]>();

	// Agent Mode
	isAgent = $state(false);
	agentCommandCallback: ((cmd: AgentCommand) => void) | null = null;

	// Cache for self state
	myState: AgentSelfState = {
		id: '',
		position: { x: 0, y: 0, z: 0 },
		rotation: 0,
		velocity: { x: 0, y: 0, z: 0 }
	};

	// Vision State (Updated by AgentController via Raycast)
	vision = $state({
		blocked: false,
		obstacleDistance: 999
	});

	constructor() {
		// In production, you would swap localhost for your deployed PartyKit URL
		const isDev = import.meta.env.DEV;

		if (typeof window !== 'undefined') {
			const host = isDev ? window.location.host : 'antigravity-server.vdud.partykit.dev';

			this.socket = new PartySocket({
				host,
				room: 'main-room',
				protocol: window.location.protocol === 'https:' ? 'wss' : 'ws'
			});

			this.socket.addEventListener('open', () => {
				// Connected
			});

			this.socket.addEventListener('close', (evt) => {
				console.warn('❌ PartySocket Closed', evt);
			});

			this.socket.addEventListener('message', (event) => {
				const msg = JSON.parse(event.data);
				this.handleMessage(msg);
			});

			// Expose Agent API
			(window as any).root0 = {
				agent: this
			};
		} else {
			// Dummy socket for SSR
			this.socket = { id: 'server', send: () => {}, addEventListener: () => {} } as any;
		}
	}

	// --- Agent Interface Implementation ---
	async connect(apiKey: string): Promise<boolean> {
		console.log('🤖 Agent connecting with key:', apiKey);
		// TODO: Validate API Key with server
		this.isAgent = true;
		return true;
	}

	disconnect(): void {
		this.isAgent = false;
		// logic to disconnect
	}

	send(command: AgentCommand): void {
		if (!this.isAgent) return;

		// Handle Chat locally first (broadcast to others via PartyKit if needed)
		if (command.type === 'chat') {
			console.log('💬 Agent speaking:', command.payload.text);
			// Broadcast to other players so they see the bubble
			if (this.socket.readyState === this.socket.OPEN) {
				this.socket.send(
					JSON.stringify({
						type: 'chat-message',
						id: crypto.randomUUID(),
						senderId: this.socket.id,
						text: command.payload.text,
						timestamp: Date.now()
					})
				);
			}
		}

		if (this.agentCommandCallback) {
			this.agentCommandCallback(command);
		}
	}

	observe(): AgentObservation {
		// Use cached state
		return {
			self: { ...this.myState, id: this.socket.id },
			nearbyEntities: Array.from(this.otherPlayers.values()).map((p) => {
				const myPos = this.myState.position;
				const dist = Math.sqrt(Math.pow(p.x - myPos.x, 2) + Math.pow(p.z - myPos.z, 2));
				return {
					id: p.id,
					type: 'player',
					position: { x: p.x, y: p.y, z: p.z },
					distance: dist
				};
			}),
			chatLog: [], // Todo: Implement Chat
			vision: this.vision,
			timestamp: Date.now()
		};
	}

	// Internal callback to link Player component to Agent commands
	registerAgentController(cb: (cmd: AgentCommand) => void) {
		this.agentCommandCallback = cb;
	}

	async setupVoice() {
		if (typeof window === 'undefined') return;
		try {
			this.myStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			console.log('[VoiceDebug] 🎙️ Microphone access granted.');
			this.evaluateRenegotiation();

			// If we already have peers (late join), add the track to them?
			// Actually, in this mesh flow, we usually connect on join.
			// If we join late, we wait for 'player-join' from others or initiate 'player-join' ourselves.
		} catch (e) {
			console.error('[VoiceDebug] ❌ Microphone access denied', e);
		}
	}

	handleMessage(msg: any) {
		if (msg.type === 'sync-music') {
			// Calculate local timestamp of when server started
			this.serverStartTime = Date.now() - msg.elapsed;
		} else if (msg.type === 'player-update') {
			const { id, data } = msg;
			if (id === this.socket.id) return;

			if (!this.otherPlayers.has(id)) {
				this.otherPlayers.set(id, { ...data, id });
			} else {
				const p = this.otherPlayers.get(id);
				if (p) Object.assign(p, data);
			}
			// FORCE REACTIVITY
			this.otherPlayers = new Map(this.otherPlayers);
		} else if (msg.type === 'chat-message') {
			// Incoming chat from another player (or agent)
			const { id, senderId, text } = msg;
			// Dispatch event for UI to pick up
			window.dispatchEvent(
				new CustomEvent('player-chat', {
					detail: { senderId, text }
				})
			);
		} else if (msg.type === 'player-join') {
			// Do NOT initiate voice immediately. Wait for position update and proximity check.
			// this.createPeer(msg.id, true);
		} else if (msg.type === 'player-leave') {
			this.otherPlayers.delete(msg.id);
			this.otherPlayers = new Map(this.otherPlayers);

			// Closeup peer
			if (this.peers.has(msg.id)) {
				this.peers.get(msg.id)?.close();
				this.peers.delete(msg.id);
			}
			if (this.voiceStreams.has(msg.id)) {
				this.voiceStreams.delete(msg.id);
				this.voiceStreams = new Map(this.voiceStreams);
			}
		} else if (msg.type === 'voice-signal') {
			this.handleSignal(msg.senderId, msg.signal);
		} else if (msg.type === 'voice-ready') {
			// Only connect if within range
			const p = this.otherPlayers.get(msg.id);
			if (p) {
				const myPos = this.myState.position;
				const dist = Math.sqrt(Math.pow(p.x - myPos.x, 2) + Math.pow(p.z - myPos.z, 2));

				if (dist <= this.VOICE_CONNECT_DISTANCE) {
					// Always clean up existing connection to ensure fresh start
					if (this.peers.has(msg.id)) {
						this.peers.get(msg.id)?.close();
						this.peers.delete(msg.id);
					}

					// Deterministic Initiation: Only one side initiates the rebuild (The one with larger ID)
					if (this.socket.id > msg.id) {
						this.createPeer(msg.id, true);
					}
				}
			}
		}
	}

	// Proximity Voice Chat Settings
	readonly VOICE_CONNECT_DISTANCE = 20; // meters (Join here)
	readonly VOICE_DISCONNECT_DISTANCE = 25; // meters (Leave here - Hysteresis)
	readonly PROXIMITY_CHECK_INTERVAL = 1000; // ms
	lastProximityCheck = 0;

	sendUpdate(data: Omit<PlayerState, 'id'>) {
		if (this.socket.readyState !== this.socket.OPEN) return;
		this.socket.send(
			JSON.stringify({
				type: 'player-update',
				data
			})
		);

		// Update local cache
		this.myState = {
			id: this.socket.id,
			position: { x: data.x, y: data.y, z: data.z },
			rotation: data.rotation,
			velocity: { x: 0, y: 0, z: 0 }
		};

		// Run proximity check periodically
		const now = Date.now();
		if (now - this.lastProximityCheck > this.PROXIMITY_CHECK_INTERVAL) {
			this.checkVoiceProximity();
			this.lastProximityCheck = now;
		}
	}

	checkVoiceProximity() {
		const myPos = this.myState.position;

		this.otherPlayers.forEach((player) => {
			const dist = Math.sqrt(
				Math.pow(player.x - myPos.x, 2) +
					Math.pow(player.y - myPos.y, 2) +
					Math.pow(player.z - myPos.z, 2)
			);

			// Logic:
			// If connected: Check if > DISCONNECT_DISTANCE
			// If not connected: Check if < CONNECT_DISTANCE

			if (this.peers.has(player.id)) {
				// We are currently connected
				if (dist > this.VOICE_DISCONNECT_DISTANCE) {
					console.log(
						`[VoiceDebug] 🔇 ${player.id} LEFT range (${dist.toFixed(1)}m > ${this.VOICE_DISCONNECT_DISTANCE}m). Disconnecting...`
					);
					this.cleanupPeer(player.id);
				}
			} else {
				// We are NOT connected
				if (dist <= this.VOICE_CONNECT_DISTANCE) {
					// Connect if we are the dominant ID (to avoid glare/collision)
					if (this.socket.id > player.id) {
						console.log(
							`[VoiceDebug] 🔊 ${player.id} ENTERED range (${dist.toFixed(1)}m <= ${this.VOICE_CONNECT_DISTANCE}m). Initiating Connection...`
						);
						this.createPeer(player.id, true);
					} else {
						// We wait for them to connect to us
						// console.log(`[VoiceDebug] ⏳ ${player.id} in range (${dist.toFixed(1)}m). Waiting for offer...`);
					}
				}
			}
		});
	}

	cleanupPeer(targetId: string) {
		if (this.peers.has(targetId)) {
			this.peers.get(targetId)?.close();
			this.peers.delete(targetId);
		}
		if (this.voiceStreams.has(targetId)) {
			this.voiceStreams.delete(targetId);
			// Force reactivity update
			this.voiceStreams = new Map(this.voiceStreams);
		}
		if (this.iceQueues.has(targetId)) {
			this.iceQueues.delete(targetId);
		}
	}

	sendVoiceReady() {
		// No-op for proximity version?
		// Actually we still need this for the initial 'mic readiness',
		// but the proximity check usually handles the connection creation.
		// We can leave it, but maybe guard it?
		if (this.socket.readyState !== this.socket.OPEN) return;
		// this.socket.send(JSON.stringify({ type: 'voice-ready' }));
		// ^ Disable global broadcast of voice-ready to prevent mass-connections.
		// Proximity loop handles it.
	}

	// Call this when we get a mic or change tracks
	evaluateRenegotiation() {
		// Just trigger a proximity check immediately
		this.checkVoiceProximity();
	}

	// WebRTC Mesh Logic
	createPeer(targetId: string, initiator: boolean) {
		if (this.peers.has(targetId)) return;
		// if (!this.myStream) return; // Allow Receive-Only if mic not ready yet

		const pc = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
		});

		// Monitor connection state
		pc.onconnectionstatechange = () => {
			const state = pc.connectionState;
			console.log(`[VoiceDebug] 📡 Peer ${targetId} connection state:`, state);
			if (state === 'failed' || state === 'disconnected' || state === 'closed') {
				// Peer died. Attempt restart if we are the initiator or if it stays dead.
				// Simple strategy: Just try to restart after a delay.
				setTimeout(() => {
					if (this.peers.has(targetId) && this.peers.get(targetId)?.connectionState === state) {
						console.warn(`🔄 Restarting peer connection to ${targetId}...`);
						this.restartPeer(targetId);
					}
				}, 2000);
			}
		};

		pc.oniceconnectionstatechange = () => {
			const state = pc.iceConnectionState;
			console.log(`[VoiceDebug] ❄️ Peer ${targetId} ICE state:`, state);
			if (state === 'failed' || state === 'disconnected') {
				// ICE failed.
				setTimeout(() => {
					if (this.peers.has(targetId) && this.peers.get(targetId)?.iceConnectionState === state) {
						console.warn(`❄️🔄 Restarting peer ICE to ${targetId}...`);
						this.restartPeer(targetId);
					}
				}, 2000);
			}
		};

		// Add my mic track if available
		if (this.myStream) {
			this.myStream.getTracks().forEach((track) => pc.addTrack(track, this.myStream!));
		}

		// Handle incoming tracks
		pc.ontrack = (event) => {
			this.voiceStreams.set(targetId, event.streams[0]);
			this.voiceStreams = new Map(this.voiceStreams);
		};

		// Handle ICE candidates
		pc.onicecandidate = (event) => {
			if (event.candidate) {
				this.sendSignal(targetId, { ice: event.candidate });
			}
		};

		// Create Offer if initiator
		if (initiator) {
			pc.createOffer().then((offer) => {
				pc.setLocalDescription(offer);
				this.sendSignal(targetId, { sdp: offer });
			});
		}

		this.peers.set(targetId, pc);
	}

	async handleSignal(senderId: string, signal: any) {
		// If we receive a signal from someone we don't have a peer for, create it (as non-initiator)
		if (!this.peers.has(senderId)) {
			// If we get an answer but don't have a peer, it's a zombie signal (ignore it)
			if (signal.sdp && signal.sdp.type === 'answer') {
				console.warn(`Ignoring zombie answer from ${senderId}`);
				return;
			}
			this.createPeer(senderId, false);
		}

		const pc = this.peers.get(senderId)!;

		try {
			if (signal.sdp) {
				// Prevent loop: If we are 'stable' and receive an 'answer', it's redundant/error
				if (pc.signalingState === 'stable' && signal.sdp.type === 'answer') {
					console.warn(`Ignoring answer from ${senderId} because signalingState is stable.`);
					return;
				}

				// If we receive an 'offer' but we are not 'stable', we might be in a glare (collision).
				// Simple conflict resolution: if we are trying to offer too, but they have higher ID, let them win?
				// For now, let's just proceed and let WebRTC roll-back if needed.

				await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

				// FLUSH ICE QUEUE
				if (this.iceQueues.has(senderId)) {
					const queue = this.iceQueues.get(senderId)!;
					console.log(`[VoiceDebug] 🧊 Flushing ${queue.length} ICE candidates for ${senderId}`);
					for (const candidate of queue) {
						await pc.addIceCandidate(candidate);
					}
					this.iceQueues.delete(senderId);
				}

				// Ensure we attach our mic tracks if we have them but haven't added them to this PC yet
				if (this.myStream) {
					const senders = pc.getSenders();
					if (senders.length === 0) {
						this.myStream.getTracks().forEach((track) => pc.addTrack(track, this.myStream!));
					}
				}

				if (signal.sdp.type === 'offer') {
					const answer = await pc.createAnswer();
					await pc.setLocalDescription(answer);
					this.sendSignal(senderId, { sdp: answer });
				}
			} else if (signal.ice) {
				// ICE candidate buffering: Only add if remote description is set
				if (pc.remoteDescription) {
					await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
				} else {
					console.warn(
						`[VoiceDebug] 🧊 Buffering ICE from ${senderId} because remoteDescription is null`
					);
					if (!this.iceQueues.has(senderId)) {
						this.iceQueues.set(senderId, []);
					}
					this.iceQueues.get(senderId)!.push(new RTCIceCandidate(signal.ice));
				}
			}
		} catch (e) {
			console.error(`Error handling signal from ${senderId}:`, e);
		}
	}

	sendSignal(targetId: string, signal: any) {
		this.socket.send(
			JSON.stringify({
				type: 'voice-signal',
				targetId,
				signal
			})
		);
	}

	restartPeer(targetId: string) {
		// Cleanup old peer
		if (this.peers.has(targetId)) {
			this.peers.get(targetId)?.close();
			this.peers.delete(targetId);
		}
		// Initiate new connection - force initiator to be true to jumpstart the process
		// But wait -- if we both restart at same time, we might collide.
		// stick to ID rule?
		if (this.socket.id > targetId) {
			this.createPeer(targetId, true);
		} else {
			// If we are the passive side, we should send a 'voice-ready' signal to prompt the other side
			// to restart their connection to us.
			// Actually, easiest is just to remove it and wait for `evaluateRenegotiation` or manually trigger it.
			this.socket.send(
				JSON.stringify({
					type: 'voice-ready',
					id: this.socket.id // Signal that I am ready
				})
			);
		}
	}
}

export const network = new NetworkManager();
