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
    - Passes the synced `color`, `metalness`, `roughness` to the remote `<Character />`.
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

## [Cinematic Landing Redesign] - 2026-02-09

### Type: Feature / Design

- **Goal**: Replace generic "crypto" landing page with a personal, cinematic "Awwwards-style" narrative.
- **Changes**:
  - **Global CSS (`src/app.css`)**:
    - Added `noise` texture overlay for organic film grain feel.
    - Defined `cubic-bezier` easing variables for silky animations.
    - Updated typography variables (added serif placeholder).
  - **Landing Page (`src/routes/+page.svelte`)**:
    - **Concept**: "The Digital Sanctuary".
    - **Animations**: Added GSAP-style entrance animations using Svelte Transitions (`fly`, `fade`).
    - **Layout**: Shifted from center-aligned hero to editorial left-align. Re-integrated full site navigation in footer.
    - **Typography**: Mixed Sans-Serif (Inter) with Italic Serif for "Personal" touch.
    - **Theming**: Added automatic Light/Dark mode detection via CSS variables and `@media (prefers-color-scheme)`.
- **Result**:
  - The site feels more like a portfolio/art-piece than a SaaS tool.
  - Interactions are weightier and smoother.
  - Adapts to user system preferences automatically.

---

## [UI Consolidation & Marketplace] - 2026-02-09

### Type: Feature / Enhancement

- **Goal**: De-clutter the HUD and provide access to extended features like the Marketplace.
- **Changes**:
  - **InterfaceUI**:
    - Replaced standalone "Connect Wallet" and "Fullscreen" buttons with a top-right **Hamburger Menu**.
    - Consolidated functionality into a new dropdown system.
    - Added direct link to `/marketplace`.
  - **New Page**:
    - Created `src/routes/marketplace/+page.svelte` (Coming Soon skeleton).
- **Result**:
  - Cleaner game interface with scalable menu system.
  - Better preparation for future features.

---

## [Continuous Audio Sync] - 2026-02-09

### Type: Bug Fix / Enhancement

- **Goal**: Fix audio desynchronization issues where speakers play at different times on different devices.
- **Changes**:
  - `src/lib/components/models/StartingRoom Models/low-poly-speakers.svelte`:
    - Added continuous drift correction loop in `useTask`.
    - Automatically snaps audio to server time if drift exceeds 0.3s.
    - Handles loop wrap-around logic for seamless playback.
- **Result**:
  - Audio playback is now frame-perfectly synced across all clients (within network latency tolerance).

---

## [Moltbook vs. Metaverse Blog Post] - 2026-02-09

### Type: Content / SEO

- **Goal**: Publish an SEO-friendly article explaining the shift from text-based AI forums ("Moltbook") to spatial metaverse environments ("root0").
- **Changes**:
  - Created `src/lib/posts/ai-metaverse-moltbook-successor.md`.
  - **Keywords**: AI Agents, Synthetic Social Media, Dead Internet Theory, Embodiment.
- **Result**:
  - New content available at `/blog/ai-metaverse-moltbook-successor`.
