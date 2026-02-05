import PartySocket from 'partysocket';

export type PlayerState = {
	id: string;
	x: number;
	y: number;
	z: number;
	rotation: number; // Y rotation
	movement: { forward: number; backward: number; up: number };
	grounded: boolean;
	character: 'male' | 'female';
};

export class NetworkManager {
	socket: PartySocket;
	otherPlayers = $state(new Map<string, PlayerState>());
	voiceStreams = $state(new Map<string, MediaStream>());

	myId = $state<string>('');
	myStream: MediaStream | null = null;
	peers = new Map<string, RTCPeerConnection>();

	constructor() {
		// In production, you would swap localhost for your deployed PartyKit URL
		const isDev = import.meta.env.DEV;

		if (typeof window !== 'undefined') {
			console.log(
				'Initializing NetworkManager connecting to:',
				isDev ? window.location.host : 'antigravity-server.vdud.partykit.dev'
			);
			this.socket = new PartySocket({
				host: isDev ? window.location.host : 'antigravity-server.vdud.partykit.dev',
				room: 'main-room',
				protocol: window.location.protocol === 'https:' ? 'wss' : 'ws'
			});

			this.socket.addEventListener('open', () => {
				console.log('✅ PartySocket Connected!');
			});

			this.socket.addEventListener('close', (evt) => {
				console.warn('❌ PartySocket Closed', evt);
			});

			this.socket.addEventListener('message', (event) => {
				const msg = JSON.parse(event.data);
				this.handleMessage(msg);
			});
		} else {
			// Dummy socket for SSR
			this.socket = { id: 'server', send: () => {}, addEventListener: () => {} } as any;
		}
	}

	async setupVoice() {
		if (typeof window === 'undefined') return;
		try {
			this.myStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			console.log('🎤 Microphone access granted');
			this.evaluateRenegotiation();

			// If we already have peers (late join), add the track to them?
			// Actually, in this mesh flow, we usually connect on join.
			// If we join late, we wait for 'player-join' from others or initiate 'player-join' ourselves.
		} catch (e) {
			console.error('❌ Microphone access denied', e);
		}
	}

	handleMessage(msg: any) {
		if (msg.type === 'player-update') {
			if (msg.id === this.socket.id) return;

			const current = this.otherPlayers.get(msg.id) || { ...msg.data, id: msg.id };
			this.otherPlayers.set(msg.id, { ...current, ...msg.data, id: msg.id });
			// FORCE REACTIVITY
			this.otherPlayers = new Map(this.otherPlayers);
		} else if (msg.type === 'player-join') {
			console.log('Player joined:', msg.id);
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
			console.log(`🎤 User ${msg.id} is voice-ready. Resetting connection...`);

			// Always clean up existing connection to ensure fresh start
			if (this.peers.has(msg.id)) {
				this.peers.get(msg.id)?.close();
				this.peers.delete(msg.id);
			}

			// Deterministic Initiation: Only one side initiates the rebuild (The one with larger ID)
			// The other side waits for the Offer.
			if (this.socket.id > msg.id) {
				console.log(`Initiating renegotiation with ${msg.id}`);
				this.createPeer(msg.id, true);
			} else {
				console.log(`Waiting for renegotiation offer from ${msg.id}`);
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
				console.log(`Renegotiating with ${id} (I am dominant)`);
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

		console.log(`Creating PeerConnection for ${targetId} (Initiator: ${initiator})`);

		const pc = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
		});

		// Monitor connection state
		pc.onconnectionstatechange = () => {
			console.log(`Connection state with ${targetId}: ${pc.connectionState}`);
		};

		// Add my mic track if available
		if (this.myStream) {
			this.myStream.getTracks().forEach((track) => pc.addTrack(track, this.myStream!));
		}

		// Handle incoming tracks
		pc.ontrack = (event) => {
			console.log(`🔊 Received audio stream from ${targetId}`);
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
			this.createPeer(senderId, false);
		}

		const pc = this.peers.get(senderId)!;

		if (signal.sdp) {
			await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

			// Ensure we attach our mic tracks if we have them but haven't added them to this PC yet
			if (this.myStream) {
				const senders = pc.getSenders();
				if (senders.length === 0) {
					console.log(`🎤 Adding missing tracks to existing peer ${senderId}`);
					this.myStream.getTracks().forEach((track) => pc.addTrack(track, this.myStream!));
				}
			}

			if (signal.sdp.type === 'offer') {
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				this.sendSignal(senderId, { sdp: answer });
			}
		} else if (signal.ice) {
			await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
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
