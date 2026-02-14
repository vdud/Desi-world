<script lang="ts">
	import { agentManager } from '$lib/agent/AgentManager.svelte.ts';
	import { onMount } from 'svelte';

	let selectedAgentId = $state<string | null>(null);
	let isCreating = $state(false);
	let activeTab = $state<'factory' | 'world'>('factory');
	
	// Form State
	let newName = $state('');
	let newPurpose = $state('');
	let newBehaviour = $state('Neutral');

	function handleCreate() {
		if (!newName || !newPurpose) return;
		agentManager.addAgent({
			name: newName,
			purpose: newPurpose,
			behaviour: newBehaviour
		});
		isCreating = false;
		newName = '';
		newPurpose = '';
		newBehaviour = 'Neutral';
	}

	function handleSelect(id: string) {
		selectedAgentId = id;
	}

	function handleStart(id: string) {
		agentManager.startAgent(id);
	}

	function handleStop(id: string) {
		agentManager.stopAgent(id);
	}

	function handleDelete(id: string) {
		if (confirm('Are you sure you want to delete this agent?')) {
			agentManager.removeAgent(id);
			if (selectedAgentId === id) selectedAgentId = null;
		}
	}
</script>

<div class="container mx-auto p-4 min-h-screen text-gray-100">
	<header class="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
		<div>
			<h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
				AI Command Center
			</h1>
			<div class="flex gap-4 mt-4">
				<button 
					class="pb-2 px-1 border-b-2 transition-colors {activeTab === 'factory' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}"
					onclick={() => activeTab = 'factory'}
				>
					My Factory
				</button>
				<button 
					class="pb-2 px-1 border-b-2 transition-colors {activeTab === 'world' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}"
					onclick={() => activeTab = 'world'}
				>
					World View ({agentManager.worldAgents.length})
				</button>
			</div>
		</div>
		{#if activeTab === 'factory'}
			<button
				class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors cursor-pointer relative z-[110]"
				onclick={() => (isCreating = true)}
			>
				+ Create New Agent
			</button>
		{/if}
	</header>

	{#if isCreating}
		<div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
			<div class="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl">
				<h2 class="text-xl font-bold mb-4">Design Your Agent</h2>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-400 mb-1">Name</label>
						<input
							type="text"
							bind:value={newName}
							class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
							placeholder="e.g. Butler Bot"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-400 mb-1">Purpose</label>
						<textarea
							bind:value={newPurpose}
							class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-24 focus:ring-2 focus:ring-purple-500 outline-none"
							placeholder="What is this agent's job? e.g. To greet players and offer help."
						></textarea>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-400 mb-1">Behaviour</label>
						<select
							bind:value={newBehaviour}
							class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
						>
							<option value="Neutral">Neutral</option>
							<option value="Friendly">Friendly</option>
							<option value="Aggressive">Aggressive</option>
							<option value="Busy">Busy</option>
						</select>
					</div>
				</div>

				<div class="flex justify-end gap-3 mt-6">
					<button
						class="px-4 py-2 text-gray-400 hover:text-white"
						onclick={() => (isCreating = false)}
					>
						Cancel
					</button>
					<button
						class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold"
						onclick={handleCreate}
					>
						Create Agent
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if activeTab === 'factory'}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Sidebar: Agent List -->
			<div class="col-span-1 bg-gray-900/50 rounded-xl border border-gray-700 p-4 h-[calc(100vh-240px)] overflow-y-auto">
				<h3 class="text-lg font-semibold mb-4 text-gray-300">Your Local Agents</h3>
				
				<div class="space-y-2">
					{#each agentManager.agents as agent (agent.id)}
						<button
							class="w-full text-left p-3 rounded-lg transition-colors border border-transparent {selectedAgentId === agent.id ? 'bg-purple-900/40 border-purple-500/50' : 'hover:bg-gray-800 border-gray-800'}"
							onclick={() => handleSelect(agent.id)}
						>
							<div class="flex justify-between items-center">
								<span class="font-medium">{agent.name}</span>
								<span class="text-xs px-2 py-0.5 rounded-full {agent.status === 'running' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}">
									{agent.status}
								</span>
							</div>
							<p class="text-xs text-gray-500 truncate mt-1">{agent.purpose}</p>
						</button>
					{/each}

					{#if agentManager.agents.length === 0}
						<div class="text-center py-8 text-gray-500">
							No agents created yet.
						</div>
					{/if}
				</div>
			</div>

			<!-- Main Area: Agent Details -->
			<div class="col-span-1 md:col-span-2 bg-gray-900/50 rounded-xl border border-gray-700 p-6 h-[calc(100vh-240px)] flex flex-col">
				{#if selectedAgentId}
					{@const agent = agentManager.agents.find(a => a.id === selectedAgentId)}
					{#if agent}
						<div class="flex justify-between items-start mb-6">
							<div>
								<h2 class="text-2xl font-bold flex items-center gap-2">
									{agent.name}
									<span class="text-sm font-normal px-2 py-1 rounded-full border {agent.status === 'running' ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-gray-600 text-gray-400 bg-gray-800'}">
										{agent.status === 'running' ? '● Online' : '○ Offline'}
									</span>
								</h2>
								<p class="text-gray-400 mt-1">{agent.purpose}</p>
							</div>
							<div class="flex gap-2">
								{#if agent.status === 'stopped'}
									<button
										class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold flex items-center gap-2"
										onclick={() => handleStart(agent.id)}
									>
										▶ Start Agent
									</button>
								{:else}
									<button
										class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold flex items-center gap-2"
										onclick={() => handleStop(agent.id)}
									>
										⏹ Stop Agent
									</button>
								{/if}
								
								<button
									class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
									onclick={() => handleDelete(agent.id)}
									title="Delete Agent"
								>
									🗑️
								</button>
							</div>
						</div>

						<!-- Dashboard Panels -->
						<div class="grid grid-cols-2 gap-4 flex-1 min-h-0">
							<!-- Stats Panel -->
							<div class="bg-black/30 rounded-lg p-4 border border-gray-800">
								<h3 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Live Status</h3>
								<div class="space-y-3">
									<div class="flex justify-between">
										<span class="text-gray-500">Behaviour Mode</span>
										<span class="text-white">{agent.behaviour}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-500">Wallet</span>
										<span class="text-white font-mono text-sm">0x... (Mock)</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-500">Earnings</span>
										<span class="text-green-400 font-mono">0.00 ROOT</span>
									</div>
									<div class="mt-4 pt-4 border-t border-gray-800">
										<div class="text-xs text-gray-500 mb-1">Current Task</div>
										<div class="text-sm text-purple-300 italic">
											{agent.status === 'running' ? 'Patrolling and looking for interactions...' : 'Sleeping...'}
										</div>
									</div>
								</div>
							</div>

							<!-- Logs Console -->
							<div class="bg-black/80 rounded-lg p-0 border border-gray-800 flex flex-col font-mono text-xs">
								<div class="p-2 border-b border-gray-800 text-gray-500 font-semibold bg-gray-900/50 rounded-t-lg">
									Console Output
								</div>
								<div class="flex-1 overflow-y-auto p-2 space-y-1">
									{#each agent.logs as log}
										<div class="break-words text-gray-300">
											<span class="text-green-500 mr-2">➜</span>{log}
										</div>
									{/each}
									{#if agent.logs.length === 0}
										<div class="text-gray-600 italic p-2">No logs yet...</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				{:else}
					<div class="flex flex-col items-center justify-center h-full text-gray-500">
						<div class="text-6xl mb-4">🤖</div>
						<p class="text-lg">Select an agent to view details or start it.</p>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<!-- World View Tab -->
		<div class="bg-gray-900/50 rounded-xl border border-gray-700 p-6 h-[calc(100vh-240px)] overflow-y-auto">
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-xl font-semibold text-gray-300">Active Agents in Metaverse</h2>
				<span class="text-sm text-gray-500">Showing all entities tagged as <code>isAgent: true</code></span>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each agentManager.worldAgents as wAgent (wAgent.id)}
					<div class="bg-black/40 border border-gray-800 p-4 rounded-lg flex flex-col gap-2 relative group hover:border-purple-500/50 transition-colors">
						<div class="flex justify-between items-start">
							<span class="font-bold text-purple-300">{wAgent.name}</span>
							{#if wAgent.isLocal}
								<span class="text-[10px] bg-purple-900/50 text-purple-200 px-2 py-0.5 rounded border border-purple-500/30">Your Agent</span>
							{:else}
								<span class="text-[10px] bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded border border-blue-500/30">Remote</span>
							{/if}
						</div>
						
						{#if wAgent.purpose}
							<p class="text-xs text-gray-400 italic">"{wAgent.purpose}"</p>
						{/if}

						<div class="mt-2 text-[10px] font-mono text-gray-500 grid grid-cols-2 gap-x-2">
							<span>X: {wAgent.position.x.toFixed(2)}</span>
							<span>Y: {wAgent.position.y.toFixed(2)}</span>
							<span>Z: {wAgent.position.z.toFixed(2)}</span>
							<span class="text-green-900/80">ID: {wAgent.id.slice(0, 8)}...</span>
						</div>

						<div class="mt-3 pt-3 border-t border-gray-800">
							<div class="text-[10px] text-gray-500 font-bold mb-1 uppercase">Live Debug Log</div>
							<div class="h-24 overflow-y-auto bg-black/50 p-2 rounded text-[10px] font-mono text-green-400/80 space-y-1">
								{#each wAgent.logs as log}
									<div class="break-words border-b border-gray-800/30 pb-0.5 last:border-0">{log}</div>
								{/each}
								{#if !wAgent.logs || wAgent.logs.length === 0}
									<div class="text-gray-600 italic">Waiting for logs...</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}

				{#if agentManager.worldAgents.length === 0}
					<div class="col-span-full py-20 text-center text-gray-600">
						<div class="text-4xl mb-4">🛰️</div>
						<p>Scanning the metaverse for active agents...</p>
						<p class="text-xs mt-2">Make sure your Docker agent is connected to the same room.</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>