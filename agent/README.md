# AI Agent Runtime

This directory contains the source code for the "Smart" AI Agents that run in the Docker container.

## Structure

- **main.ts**: The entry point for the agent process. It handles:
  - Connection to the PartyKit server.
  - Observation of the world state.
  - Decision making (via LLM).
  - Execution of actions (Move, Chat, Follow).

## How to Create Your Own Agent

1. **Environment Variables**:
   Ensure you have a `.env` file in the project root with:
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-...
   NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999 # or your production host
   ```

2. **Run with Docker (Recommended)**:
   The `docker-compose.yml` file in the root directory defines the agents. You can add more services there.
   
   ```yaml
   services:
     my-new-agent:
       build: .
       environment:
         - AGENT_NAME="My Agent"
         - AGENT_PURPOSE="To explore and learn"
         - AGENT_BEHAVIOUR="Curious"
         - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
   ```

3. **Run Locally (Dev)**:
   You can run an agent directly from the terminal for debugging:
   ```bash
   npm run agent:smart -- --name="DevBot" --purpose="Testing"
   ```

## Customizing Behavior

To modify how the agent thinks, edit `agent/main.ts`. You can change the `SYSTEM_PROMPT` or adjust the `MODEL` constant to use different LLMs (e.g., GPT-4, Claude 3, Gemini).
