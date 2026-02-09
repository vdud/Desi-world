# root0 Project Overview

## 1. Introduction

root0 is a web-based **metaverse application** built to run directly in modern browsers without installation. It features a persistent 3D world where users control avatars, explore environments, and interact with physics-enabled objects.

The "metaverse" concept in this project implies:

- **Seamless Connectivity**: Instant access via URL.
- **Persistent Interactions**: State follows the user session.
- **Immersive 3D**: High-fidelity rendering with shadows, lighting, and physics.
- **Avatar Identity**: Third-person character control.

---

## 2. Technology Stack

### Core Frameworks

- **SvelteKit 5**: The application backbone, utilizing the new **Runes** system for fine-grained reactivity.
- **Threlte 8**: A declarative Three.js wrapper for Svelte, bridging DOM state with WebGL rendering.
- **Three.js**: The underlying 3D graphics engine.
- **Rapier / @threlte/rapier**: Fast, deterministic rigid-body physics engine (WASM-based).
- **Vite**: The build tool and dev server.
- **pnpm**: Fast, disk space efficient package manager.
- **PartyKit**: WebSocket infrastructure for real-time multiplayer.
- **Reown AppKit**: Web3 Wallet connection (formerly WalletConnect).
- **GSAP / Svelte Transitions**: Cinematic animations for the landing page.

---

## 3. High-Level Architecture

### Scene hierarchy

The application has two main entry points:

1. `src/routes/+page.svelte`: The Cinematic Landing Page (Marketing/Entry).
2. `src/routes/play/+page.svelte`: The 3D Game Context.

`src/routes/play/+page.svelte` renders the full-screen `App` component:

`src/lib/components/App.svelte`
├── `InterfaceUI` (2D HUD, Overlay, Wallet)
└── `Canvas` (3D Context)
├── `Sky` & Lighting
├── `Physics World`
└── `Scene`
├── `Player` (Avatar, Controller, Camera)
├── `NetworkPlayer` (Remote Avatars)
└── `ProximityLoader` (Dynamic Asset Management)

### Rendering & Physics Loop

The interaction loop is separate from Svelte's reactive rendering:

1. **Svelte State**: Captures inputs (Keyboard/Mouse) and updates `$state` proxies.
2. **Threlte `useTask`**: Runs on every frame (requestAnimationFrame).
3. **Physics Sync**: `Player.svelte` applies forces to the Rapier `RigidBody`.
4. **Camera Follow**: `ThirdPersonControls.svelte` interpolates camera position based on player physics position.

---

## 4. State Management Patterns

### Hybrid Approach: Runes & Stores

#### Svelte 5 Runes (`$state`, `$derived`, `$effect`)

Used for **Local Component State** and **Tree-Down Data Flow**.

- **Why**: Runes offer superior performance and less boilerplate for complex mutable objects (like vectors or input maps).
- **Example**: Input handling in `App.svelte` uses a `$state` object for movement keys, passing it down to the Player and UI.

#### Svelte Stores (`writable`)

Used for **Global Signals** and **Cross-Hierarchy Communication**.

- **Where**: `src/lib/stores/commonStores.ts`
- **Why**: Decouples systems that shouldn't know about each other (e.g., The `ProximityLoader` acts on `playerPosition` without needing a direct reference to the Player component).
- **Key Stores**:
  - `playerPosition`: Updated frame-by-frame by the player; consumed by the loader.
  - `isPlane`: A debug/state toggle.

---

## 5. Asset Loading & Performance Strategy

### Proximity Loading (`ProximityLoader.svelte`)

To support a potentially infinite world without crashing the browser, the app uses a **Distance-Based Level of Detail (LOD)** system.

- **Load Radius**: Objects enter the scene when the player enters their zone.
- **Unload Radius**: Objects are disposed of when the player leaves, freeing memory.
- **Queue System**: Assets load one by one (`loadingQueue`) to prevent frame skips (jank) during rapid movement.
- **Dynamic Imports**: Uses Vite's dynamic import capabilities to fetch model code only when needed.

---

## 6. Multiplayer Architecture

### PartyKit + WebRTC

- **State Sync**: `src/lib/network/network.svelte.ts` uses PartyKit (WebSockets) to broadcast player position/rotation to the room.
- **Voice Chat**: Uses WebRTC Mesh networking. Peers connect directly to each other for low-latency audio.
  - **Signaling**: Handled via PartyKit messages (`voice-signal`, `voice-ready`).
- **Interpolation**: Remote players are smoothed using linear interpolation to prevent jitter.

---

## 7. Web3 & Site Structure

### Web3 Integration

- **Singleton Pattern**: `src/lib/web3/web3.svelte.ts` manages wallet state globally.
- **Reown AppKit**: Provides the "Connect Wallet" modal and supports multiple chains (Mainnet, Arbitrum, Base).

### Extended Site

The project is now a full website, not just a game canvas:

- **Blog**: Powered by `mdsvex` (Markdown).
- **Legal**: Privacy Policy, TOS skeletons.
- **Marketplace**: Placeholder for future NFT/Item trading.

---

## 8. Client vs. Server

This is primarily a **Client-Side SPA**.

- **Server**: Handles initial HTML delivery (SSR) and static asset serving.
- **Client**: Handles all physics, rendering, input, and state logic.
- **SSR Constraints**: The 3D Canvas cannot be server-rendered. It initializes strictly on the client.

---

## 9. Known Limitations & TODOs

- **Multiplayer**: Basic movement and Voice are tailored for small lobbies (Mesh networking scales poorly > 10 players).
- **Physics Tunneling**: Fast movement might clip through thin walls (standard physics engine limitation).
- **Store vs Runes**: The codebase currently mixes `writable` stores and `Runes`. Future Refactors might consolidate these.
