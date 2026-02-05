# Antigravity Project Overview

## 1. Introduction

Antigravity is a web-based **metaverse application** built to run directly in modern browsers without installation. It features a persistent 3D world where users control avatars, explore environments, and interact with physics-enabled objects.

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

---

## 3. High-Level Architecture

### Scene hierarchy

The application entry point is `src/routes/+page.svelte`, which renders a full-screen `App` component.

`src/lib/components/App.svelte`
├── `InterfaceUI` (2D HUD, Overlay)
└── `Canvas` (3D Context)
├── `Sky` & Lighting
├── `Physics World`
└── `Scene`
├── `Player` (Avatar, Controller, Camera)
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

## 6. Client vs. Server

This is primarily a **Client-Side SPA**.

- **Server**: Handles initial HTML delivery (SSR) and static asset serving.
- **Client**: Handles all physics, rendering, input, and state logic.
- **SSR Constraints**: The 3D Canvas cannot be server-rendered. It initializes strictly on the client.

---

## 7. Known Limitations & TODOs

- **Multiplayer**: Currently single-player only. No WebSocket sync is implemented.
- **Physics Tunneling**: Fast movement might clip through thin walls (standard physics engine limitation).
- **Store vs Runes**: The codebase currently mixes `writable` stores and `Runes`. Future Refactors might consolidate these.
