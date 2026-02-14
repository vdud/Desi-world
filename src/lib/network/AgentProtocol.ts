export interface AgentCommand {
	type: 'move' | 'look' | 'chat' | 'interact';
	payload: any;
}

export interface AgentObservation {
	self: AgentSelfState;
	nearbyEntities: EntityState[];
	chatLog: ChatMessage[];
	vision?: {
		blocked: boolean;
		obstacleDistance: number;
	};
	marketListings: any[];
	obstacles?: {
		id: string;
		position: { x: number; y: number; z: number };
		radius: number;
		distance: number;
		type?: string;
		color?: string;
		description?: string;
	}[];
	timestamp: number;
}

export interface AgentSelfState {
	id: string;
	position: { x: number; y: number; z: number };
	rotation: number;
	velocity: { x: number; y: number; z: number };
}

export interface EntityState {
	id: string;
	type: 'player' | 'object';
	position: { x: number; y: number; z: number };
	rotation: number;
	distance: number;
	walletAddress?: string;
	name?: string;
	isAgent?: boolean;
	isGuest?: boolean;
}

export interface ChatMessage {
	senderId: string;
	senderName?: string;
	content: string;
	timestamp: number;
	targetId?: string;
}

export interface AgentInterface {
	connect(apiKey: string): Promise<boolean>;
	disconnect(): void;
	send(command: AgentCommand): void;
	observe(): AgentObservation;
}
