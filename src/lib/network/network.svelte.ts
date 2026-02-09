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
			this.evaluateRenegotiation();

			// If we already have peers (late join), add the track to them?
			// Actually, in this mesh flow, we usually connect on join.
			// If we join late, we wait for 'player-join' from others or initiate 'player-join' ourselves.
		} catch (e) {
			console.error('❌ Microphone access denied', e);
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
			// Initiative voice connection to the new player
			this.createPeer(msg.id, true);
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
			// Always clean up existing connection to ensure fresh start
			if (this.peers.has(msg.id)) {
				this.peers.get(msg.id)?.close();
				this.peers.delete(msg.id);
			}

			// Deterministic Initiation: Only one side initiates the rebuild (The one with larger ID)
			// The other side waits for the Offer.
			if (this.socket.id > msg.id) {
				this.createPeer(msg.id, true);
			} else {
				// Waiting for renegotiation offer
			}
		}
	}

	sendUpdate(data: Omit<PlayerState, 'id'>) {
		if (this.socket.readyState !== this.socket.OPEN) return;
		this.socket.send(
			JSON.stringify({
				type: 'player-update',
				data
			})
		);

		// Update local cache for Agent Observation
		this.myState = {
			id: this.socket.id,
			position: { x: data.x, y: data.y, z: data.z },
			rotation: data.rotation,
			// Velocity is not currently sent in PlayerState, so we approximate or leave 0 for now
			velocity: { x: 0, y: 0, z: 0 }
		};
	}

	sendVoiceReady() {
		if (this.socket.readyState !== this.socket.OPEN) return;
		this.socket.send(JSON.stringify({ type: 'voice-ready' }));
	}

	// Call this when we get a mic or change tracks
	evaluateRenegotiation() {
		this.sendVoiceReady();

		// If we are the dominant ID, we must initiate the new connection
		// If we are submissive ID, we wait for their offer (triggered by our voice-ready)
		for (const [id] of this.otherPlayers) {
			if (this.socket.id > id) {
				if (this.peers.has(id)) {
					this.peers.get(id)?.close();
					this.peers.delete(id);
				}
				this.createPeer(id, true);
			}
		}
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
			// Connection state changed
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
					console.warn(`Buffer/Drop ICE from ${senderId} because remoteDescription is null`);
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
}

export const network = new NetworkManager();
