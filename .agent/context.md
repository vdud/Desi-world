# Root0 Metaverse Project Context

## Overview

Root0 is a 3D metaverse application built with **SvelteKit 5 (Runes)**, **Threlte 8 (Three.js)**, **Rapier (Physics)**, and **PartyKit (Multiplayer/WebSockets)**. It features a persistent world where users (and AI agents) interact, trade items, and explore.

## key Technology Stack

- **Frontend Framework**: SvelteKit (Svelte 5 Runes syntax).
- **3D Engine**: Threlte (@threlte/core, @threlte/extras) which wraps Three.js.
- **Physics**: @dimforge/rapier3d-compat via @threlte/rapier.
- **Multiplayer/Server**: PartyKit (serverless WebSockets).
- **Styling**: TailwindCSS.
- **AI Integration**: OpenAI (via OpenRouter) used in `scripts/ai-agent.ts`.

## Core Directory Structure

### `src/` (Application Source)

- **`src/routes/`**: Main SvelteKit pages and layouts. The entry point for the client app.
- **`src/lib/`**: Contains core logic, components, and stores.
  - **`components/`**: Reusable Svelte components (UI, 3D objects, Player avatars).
    - `Player/`: Player avatar logic and UI.
  - **`network/`**: Networking logic connecting to PartyKit.
    - `HeadlessAgent.ts`: A specialized client for AI agents to interact with the game server without a browser.
  - **`stores/`**: Svelte stores for state management (e.g., `commonStores.ts`).
- **`src/party/`**: Server-side logic.
  - `server.ts`: The authoritative PartyKit server handling connections, state synchronization (player positions, chat), and the marketplace.

### `scripts/` (Automation & Agents)

- **`scripts/ai-agent.ts`**: A standalone script that runs an autonomous AI agent. It uses `HeadlessAgent` to connect to the server and `OpenAI` to decide on actions (MOVE, SAY, etc.).

### `contracts/` (Blockchain)

- Contains Smart Contracts (Solidity) for the game's economy (Tokens, NFTs).

## Critical Files & Concepts

- **`package.json`**: Defines dependencies and scripts (e.g., `npm run dev`, `npm run agent`).
- **`src/party/server.ts`**: The "Brain" of the multiplayer session. Handles `onConnect`, `onMessage` (player-update, chat-message, market-list-item), and broadcasts updates.
- **`scripts/ai-agent.ts`**: The "Mind" of an NPC. It runs a loop: Observation -> LLM Decision -> Action (Move/Say).

## Development Conventions

- **Svelte 5 Runes**: Use `$state`, `$derived`, `$effect` instead of legacy stores where possible in new components.
- **Threlte**: 3D components are declarative Svelte components.
