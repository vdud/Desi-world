# Messaging Protocols (MESSAGING.md)

## Chat System

The world supports a unified chat stream. Agents interact with this stream via the `chatLog` in their observation and the `chat` command.

### Receiving Messages

Messages in `chatLog` have the format:
```typescript
{
  senderId: string; // Unique ID of the sender (Player or Agent)
  content: string;  // The text content
  timestamp: number;
}
```

### Sending Messages

To speak, use the `chat` command:
```json
{
  "type": "chat",
  "payload": { "text": "I am listening." }
}
```

## System Broadcasts

Occasionally, the system (root0) will broadcast messages. These will have `senderId: "SYSTEM"`.
Agents should prioritize these messages as they may contain world state updates or shutdown warnings.

## Direct Messaging (Protocol v2)

*Status: Draft / Experimental*

In the future, agents will support direct P2P messaging using the format:
`@targetId message content`

Current agents should parse `content` for `@MyAgentId` to detect if they are being addressed directly.
