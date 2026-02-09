# AI Changelog

This file tracks all modifications made by AI collaborators to the root0 codebase.
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

## [Routing Restructure] - 2026-02-09

### Type: Refactor / Feature

- **Goal**: Move the 3D game to `/play` and create a landing page at `/` with skeleton pages for legal/about sections.
- **Changes**:
  - **Routes**:
    - Moved `src/routes/+page.svelte` (Game) to `src/routes/play/+page.svelte`.
    - Created new `src/routes/+page.svelte` (Landing Page) with "Enter World" CTA.
    - Created `src/routes/about/+page.svelte` (Skeleton).
    - Created `src/routes/privacy-policy/+page.svelte` (Skeleton).
    - Created `src/routes/terms-of-service/+page.svelte` (Skeleton).
  - **Styling**:
    - Created `src/app.css` for global styles (dark theme, typography).
    - Updated `src/routes/+layout.svelte` to import `app.css`.
- **Result**:
  - The root URL `/` now shows a landing page.
  - The game is accessible at `/play`.
  - Placeholder pages exist for future content.

---

## [Site Expansion] - 2026-02-09

### Type: Feature

- **Goal**: Create a comprehensive website structure around the game, including a Blog, Legal pages, and Information pages.
- **Changes**:
  - **Blog System**:
    - Integrated `mdsvex` for Markdown-based blogging.
    - Created `src/routes/blog` (Index) and `src/routes/blog/[slug]` (Post View).
    - Added sample post in `src/lib/posts/welcome.md`.
  - **New Pages**:
    - `Cookie Policy`, `FAQ`, `The World` (Features).
    - `Changelog` (User facing), `Community`, `How It Works`.
    - `Roadmap`, `Community Guidelines`.
    - `404` Error Page.
  - **SEO**:
    - Added `<title>` and `<meta name="description">` tags to all new pages.
- **Result**:
  - The application is now a full website, not just a game canvas.
  - Content can be easily managed via Markdown.

---

## [Web3 Integration] - 2026-02-09

### Type: Feature

- **Goal**: Enable crypto wallet connection using Reown AppKit (formerly WalletConnect).
- **Changes**:
  - **Dependencies**: Added `@reown/appkit`, `@wagmi/core`, `viem`.
  - **Skill**: Created `.agent/skills/web3-integration/SKILL.md`.
  - **Core Logic**: Created `src/lib/web3/web3.svelte.ts` singleton using Runes.
  - **UI**:
    - Created `src/lib/components/ui/ConnectWallet.svelte`.
    - Added Connect button to Landing Page Header (`src/routes/+page.svelte`).
    - Added Connect button to Game HUD (`src/lib/components/Player/Player Controller/InterfaceUI.svelte`).
- **Result**:
  - Users can connect their EVM wallets (Metamask, Rainbow, etc.) on Mainnet, Arbitrum, or Base.
  - Wallet state is reactive via Svelte 5 Runes.

---
