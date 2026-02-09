# Architecture Decisions

This document records the significant architectural choices made in the root0 project. It serves as a guide for understanding _why_ the code works the way it does.

## 1. Hybrid Reactivity: Runes (`$state`) + Stores (`writable`)

### Context

Svelte 5 introduced Runes as a new, more performant reactivity model. However, the ecosystem (and developer habits) still rely on Svelte 4 context/store patterns.

### Decision

**Use Runes for Component Internals, Use Stores for Global Signals.**

### Why

- **Runes**: Ideal for complex local state logic (like the input handling object in `App.svelte`). They prevent "prop drilling" overhead when passing mutable state deep into component trees.
- **Stores**: The `playerPosition` needs to be subscribed to by components that are nowhere near the `Player` in the component tree (e.g., `ProximityLoader`). Passing a `$state` object through 5 layers of parents just to reach a loader is poor DX. Stores provide a known, simple "Pub/Sub" mechanism for these disconnected systems.

### Implications

- We must be careful not to introduce "sync loops" where a Store updates a Rune which updates the Store.
- Future refactor: We could move `playerPosition` to a global `$state` context (Context API + Runes) to fully align with Svelte 5 patterns.

---

## 2. Threlte 8 & Component-Based 3D

### Context

Three.js can be written in imperative JavaScript (creating classes, adding to scene manually). Threlte offers a declarative, HTML-like syntax (`<T.Mesh>`, `<T.Group>`).

### Decision

**Strict adherence to declarative Threlte components over raw Three.js.**

### Why

- **Reactivity**: Svelte's reactivity engine naturally handles 3D interactions (e.g., `{#if condition}<Mesh/>{/if}` automatically adds/removes objects from the scene).
- **Readability**: The scene hierarchy is visible in the code structure, matching the visual tree.
- **Resource Disposal**: Threlte handles memory cleanup (geometry/material disposal) automatically when components unmount, which is a major source of leaks in raw Three.js.

### Alternatives Not Taken

- **Raw Three.js**: Harder to maintain state sync with UI.
- **React/R3F**: Project requirement was SvelteKit.

---

## 3. The Proximity Loader System

### Context

Web browsers have strict memory limits (especially on mobile). Loading a massive world at once causes crashes.

### Decision

**Implement a custom Distance-Based Loading System with Sequential Queuing.**

### Why

- **Memory**: Only nearby assets exist in RAM.
- **Performance**: The built-in queue system prevents "Jank" (frame drops). If we spawned 100 objects in the same frame, the renderer would freeze. By spawning one every `loadDelay` ms, we maintain 60FPS.

### Implications

- Asset components must be designed to be created/destroyed frequently. They cannot hold permanent internal state (or it will be lost on unload).
- State that must persist (like "Has the user solved this puzzle?") must be saved in a global store, separate from the 3D model component.

---

## 4. Physics-Driven Movement (Third Person)

### Context

Moving an avatar can be done by directly updating `position.x/z` (kinematic) or by applying forces (dynamic).

### Decision

**Dynamic Rigidbody Character Controller.**

### Why

- **Interaction**: Allows the player to push objects, slide down slopes, and bounce off walls naturally.
- **Gravity**: Free handling of falling and jumping without writing custom gravity logic.

### Implications

- **Input Lag**: There is a microscopic delay between pressing a key and the physics engine simulating the force.
- **Camera Smoothing**: The camera cannot be parented directly to the player mesh, or it would jitter. It must strictly "follow" the computed position with interpolation (Learp).

---

## 5. Client-Side Only Rendering

### Context

SvelteKit defaults to Server-Side Rendering (SSR).

### Decision

**Force Client-Side Rendering for the 3D Canvas.**

### Why

- Three.js and WebGL cannot run in Node.js (Server).
- Any attempt to render `<Canvas>` on the server causes immediate crashes.
- Any attempt to render `<Canvas>` on the server causes immediate crashes.
- We deliberately use dynamic imports or browser checks to ensure 3D logic never runs during SSR.

---

## 6. Package Management

### Decision

**Use `pnpm` exclusively.**

### Why

- **Performance**: Faster installation speed.
- **Disk Space**: Efficient content-addressable storage.
- **Strictness**: Prevents phantom dependencies (accessing packages not listed in package.json).
