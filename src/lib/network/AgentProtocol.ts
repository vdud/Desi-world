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
	distance: number;
}

export interface ChatMessage {
	senderId: string;
	content: string;
	timestamp: number;
}

export interface AgentInterface {
	connect(apiKey: string): Promise<boolean>;
	disconnect(): void;
	send(command: AgentCommand): void;
	observe(): AgentObservation;
}
