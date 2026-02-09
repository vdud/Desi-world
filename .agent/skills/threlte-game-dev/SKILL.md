---
name: Threlte Game Dev
description: Guidelines for 3D development using Threlte 8, Three.js, and Rapier Physics. Verified against Threlte 8 migration docs.
---

# Threlte Game Dev Guidelines

This skill defines how to build 3D features in root0.
Ref: https://threlte.xyz/docs/reference/v8-migration

## 1. Component vs. Imperative

Prefer declarative `<T.Mesh>` components over imperative `new Mesh()`.

- **Reason**: Life-cycle management (auto-disposal) is handled by Threlte.
- **New in v8**: `<T>` supports individual prop evaluation and better event alignment with Svelte 5.

## 2. The Loop: `useTask` (NOT `useFrame`)

Threlte 8 officially replaces `useFrame` with `useTask`.

```typescript
import { useTask } from '@threlte/core';

useTask((delta) => {
	// Logic here runs every frame
	// delta is in seconds
});
```

## 3. Physics (Rapier)

- Use `@threlte/rapier` components: `<RigidBody>`, `<Collider>`, `<World>`.
- **Collision Groups Warning**: Rapier uses **Bitmasks**, not IDs.
  - Groups 0-15 are membership bits.
  - To collide with group 0 and 2, the filter is `(1 << 0) | (1 << 2)`.
  - Use the `interactionGroups(members, filter)` helper if available, or raw bitwise math. Do not pass `[0, 1]` arrays unless using a helper that supports it.

## 4. Asset Loading

**Strict Rule**: All heavy assets (GLTF) must go through the `ProximityLoader` system if they are part of the world map.

- Do not blindly import huge models in the root layout.
- Use `useGltf` from `@threlte/extras`.

## 5. Camera Control

The camera logic lives in `ThirdPersonControls.svelte`.

- The main camera must `makeDefault`.
- Do not manually lerp camera positions without `useTask`.

## 6. Math & Vectors

- Avoid creating `new Vector3()` inside the render loop (`useTask`).
- Create reusable `const tempVec = new Vector3()` outside the component scope.
