# MCP Resources & Tooling Strategy

This document outlines the **Model Context Protocol (MCP)** tools, servers, and skills identified to enhance the development of root0. These resources are selected to specifically support the **SvelteKit 5**, **Threlte 8**, and **Three.js** technology stack.

---

## 1. Core MCP Servers

These servers provide direct integration with the frameworks and platforms used in this project.

### **Official Svelte MCP Server**

- **Description**: Created by the Svelte team, this server provides tools to access Svelte 5 documentation and validate code patterns. It includes a `svelte-autofixer` tool.
- **Relevance**: Critical for ensuring correct usage of **Runes** (`$state`, `$derived`, `$effect`) and preventing the mixing of legacy Svelte 4 syntax.
- **Integration**:
  - Connect via `npx` or Docker.
  - Use `svelte-autofixer` to audit components for reactivity bugs.
- **Resources**: [Official Svelte MCP Announcement](https://sveltetalk.com)

### **GitHub MCP Server**

- **Description**: Developed by Anthropic/GitHub, enables AI agents to search issues, inspect PRs, and read file history directly.
- **Relevance**: Facilitates project management and "context awareness" of recent changes without manually copying git logs.
- **Integration**: Connect to the `vdud/Desi-world` repository.
- **Resources**: [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

### **PostgreSQL / Database MCP**

- **Description**: Interfaces with SQL databases to inspect schemas and run queries.
- **Relevance**: Future-proofing for multiplayer features or persistent world states (if a backend DB is added).
- **Integration**: Connect to local or Supabase instances.

### **Playwright / Browser MCP**

- **Description**: Allows the AI to control a headless browser for end-to-end testing.
- **Relevance**: Essential for validating that the 3D Canvas loads correctly and that no WebGL errors occur on startup.

---

## 2. External Knowledge & Research Tools

Tools to help the AI "ground" itself in documentation that is newer than its training data (e.g., latest Threlte releases).

### **Brave Search MCP**

- **Description**: Privacy-focused web search tool.
- **Relevance**: **High**. Threlte 8 and Rapier physics documentation changes frequently. The AI usage of this tool reduces hallucinations about 3D math and component props.
- **Usage**: "Search for `Threlte 8 useGlTF` syntax."

### **Fetch / Link Reader**

- **Description**: Converts URL content to Markdown for the AI to read.
- **Relevance**: Allows the AI to ingest specific GitHub issues or documentation pages provided by the user.

---

## 3. Toolkits & SDKs

Libraries for building _custom_ tools specific to the root0 engine.

### **TypeScript MCP SDK**

- **Description**: The official SDK for building MCP servers in TypeScript.
- **Relevance**: Used to build a custom "root0 Debug Server".
- **Potential Custom Tools**:
  - `listAssets()`: Return strict list of available GLB models.
  - `teleportPlayer(x, y, z)`: Modify the running dev server state (via HMR or websocket).
- **Repo**: [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk)

### **@vercel/mcp-adapter**

- **Description**: Adapter to run MCP servers on Vercel or within SvelteKit endpoints.
- **Relevance**: Deployment helper if we decide to host our custom tools online.

---

## 4. Community Resources

- **`appcypher/awesome-mcp-servers`**: A curated list of community-made MCP servers.
- **`modelcontextprotocol/servers`**: The official monorepo containing reference implementations for filesystem, git, and postgres servers.

---

## 5. Recommended "Skills" for root0

To maximize productivity, the following "Skills" (prompt contexts + tool configs) should be defined for the AI:

1.  **Skill: `Svelte 5 Expert`**
    - **Context**: "You are a strict Svelte 5 compiler. Reject all `export let` syntax. Use `$props()`."
    - **Tools**: Svelte MCP, Linter.

2.  **Skill: `3D Math Helper`**
    - **Context**: "You are a 3D Graphics mathematician. Prefer `gl-matrix` or Three.js `Vector3` methods over raw arithmetic."
    - **Tools**: Python (for complex calc verification) or specific Math MCP.
