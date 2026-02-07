# AI Changelog

This file tracks all modifications made by AI collaborators to the Antigravity codebase.
Future AI sessions must check this file to understand the latest state of the project.

---

## [Randomized Character Materials] - 2026-02-07

### Type: Feature / Enhancement

- **Goal**: Randomize the color, metalness, and roughness of the "Anon" character for each player and sync it across the network.
- **Components Changed**:
  - `src/lib/network/network.svelte.ts`:
    - Updated `PlayerState` to include `color`, `metalness`, and `roughness`.
  - `src/lib/components/Player/Player.svelte`:
    - Generates random values for visual properties on mount (`#hex`, `0-1`, `0-1`).
    - Broadcasts these values in the `network.sendUpdate` payload.
    - Passes these values to the local `<Character />`.
  - `src/lib/components/Player/Character.svelte`:
    - Added `color`, `metalness`, `roughness` to props (with defaults).
    - **Material Cloning**: In `oncreate`, now clones the mesh material to ensure unique instances.
    - Applies the passed props to the cloned material.
  - `src/lib/components/NetworkPlayer.svelte`:
    - Passes the synced `color`, `metalness`, and `roughness` from `props.state` to the remote `<Character />`.
- **Result**:
  - Every player spawns with a unique look.
  - The look reflects accurately for other players over the network.

---
