import type * as Party from 'partykit/server';

export type PlayerState = {
	id: string;
	x: number;
	y: number;
	z: number;
	rotation: number;
	animation: string;
};

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {}

	onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		console.log(`Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`);

		// Notify others that a new player joined
		this.room.broadcast(
			JSON.stringify({
				type: 'player-join',
				id: conn.id
			}),
			[conn.id]
		);
	}

	onMessage(message: string, sender: Party.Connection) {
		const data = JSON.parse(message);

		// Re-broadcast updates to everyone else
		if (data.type === 'player-update') {
			this.room.broadcast(
				JSON.stringify({
					type: 'player-update',
					id: sender.id,
					data: data.data
				}),
				[sender.id]
			);
		} else if (data.type === 'voice-signal') {
			// Direct P2P signaling (Offer/Answer/ICE)
			// We only send this to the specific target, not broadcast
			const target = this.room.getConnection(data.targetId);
			if (target) {
				target.send(
					JSON.stringify({
						type: 'voice-signal',
						senderId: sender.id,
						signal: data.signal
					})
				);
			}
		}
	}

	onClose(conn: Party.Connection) {
		// Notify others that player left
		this.room.broadcast(
			JSON.stringify({
				type: 'player-leave',
				id: conn.id
			})
		);
	}
}
