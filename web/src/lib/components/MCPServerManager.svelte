<script lang="ts">
  import { onMount } from 'svelte'

  interface MCPServer {
    id: string
    name: string
    type: 'stdio' | 'sse' | 'http'
    command?: string
    args?: string[]
    url?: string
    env?: Record<string, string>
  }

  interface MCPTool {
    name: string
    description?: string
    inputSchema?: Record<string, unknown>
  }

  interface ConnectionStatus {
    [serverId: string]: boolean
  }

  let servers: MCPServer[] = []
  let connectionStatus: ConnectionStatus = {}
  let selectedServerTools: { [serverId: string]: MCPTool[] } = {}
  let expandedServers: Set<string> = new Set()
  let loading = false
  let error = ''

  const API_BASE = 'http://localhost:3000/api'

  async function loadServers() {
    loading = true
    error = ''
    try {
      const response = await fetch(`${API_BASE}/servers`)
      const data = await response.json()
      servers = data.servers || []

      // Check connection status for each server
      for (const server of servers) {
        await checkConnectionStatus(server.id)
      }
    } catch (err) {
      error = 'Failed to load servers'
      console.error(err)
    } finally {
      loading = false
    }
  }

  async function checkConnectionStatus(serverId: string) {
    try {
      const response = await fetch(`${API_BASE}/servers/${serverId}/status`)
      const data = await response.json()
      connectionStatus[serverId] = data.connected || false
    } catch {
      connectionStatus[serverId] = false
    }
  }

  async function connectToServer(serverId: string) {
    loading = true
    error = ''
    try {
      const response = await fetch(`${API_BASE}/servers/${serverId}/connect`, {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        connectionStatus[serverId] = data.connected
      } else {
        error = data.error || 'Failed to connect to server'
      }
    } catch (err) {
      error = 'Connection failed'
      console.error(err)
    } finally {
      loading = false
    }
  }

  async function disconnectFromServer(serverId: string) {
    loading = true
    error = ''
    try {
      const response = await fetch(`${API_BASE}/servers/${serverId}/disconnect`, {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        connectionStatus[serverId] = false
        delete selectedServerTools[serverId]
      } else {
        error = data.error || 'Failed to disconnect from server'
      }
    } catch (err) {
      error = 'Disconnection failed'
      console.error(err)
    } finally {
      loading = false
    }
  }

  async function loadServerTools(serverId: string) {
    if (expandedServers.has(serverId)) {
      expandedServers.delete(serverId)
      expandedServers = new Set(expandedServers)
      return
    }

    loading = true
    error = ''
    try {
      const response = await fetch(`${API_BASE}/servers/${serverId}/tools`)
      const data = await response.json()

      if (response.ok) {
        selectedServerTools[serverId] = data.tools || []
        expandedServers.add(serverId)
        expandedServers = new Set(expandedServers)
      } else {
        error = data.error || 'Failed to load tools'
      }
    } catch (err) {
      error = 'Failed to load tools'
      console.error(err)
    } finally {
      loading = false
    }
  }

  async function executeTool(serverId: string, toolName: string, args: Record<string, unknown>) {
    loading = true
    error = ''
    try {
      const response = await fetch(`${API_BASE}/servers/${serverId}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      })
      const data = await response.json()

      if (response.ok) {
        return data.result
      } else {
        error = data.error || 'Failed to execute tool'
        return null
      }
    } catch (err) {
      error = 'Tool execution failed'
      console.error(err)
      return null
    } finally {
      loading = false
    }
  }

  onMount(() => {
    loadServers()
  })
</script>

<div class="mcp-server-manager">
  <div class="header">
    <h2>MCP Server Manager</h2>
    <button onclick={() => loadServers()} disabled={loading}> Refresh </button>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading...</div>
  {/if}

  <div class="servers">
    {#each servers as server (server.id)}
      <div class="server-card">
        <div class="server-header">
          <div class="server-info">
            <h3>{server.name}</h3>
            <span class="server-type">{server.type}</span>
            {#if connectionStatus[server.id]}
              <span class="status connected">Connected</span>
            {:else}
              <span class="status disconnected">Disconnected</span>
            {/if}
          </div>

          <div class="server-actions">
            {#if connectionStatus[server.id]}
              <button onclick={() => disconnectFromServer(server.id)}> Disconnect </button>
              <button onclick={() => loadServerTools(server.id)}> View Tools </button>
            {:else}
              <button onclick={() => connectToServer(server.id)}> Connect </button>
            {/if}
          </div>
        </div>

        {#if server.command}
          <div class="server-detail">
            <strong>Command:</strong>
            {server.command}
            {server.args?.join(' ') || ''}
          </div>
        {/if}

        {#if server.url}
          <div class="server-detail">
            <strong>URL:</strong>
            {server.url}
          </div>
        {/if}

        {#if expandedServers.has(server.id) && selectedServerTools[server.id]}
          <div class="tools-section">
            <h4>Available Tools</h4>
            <div class="tools-list">
              {#each selectedServerTools[server.id] as tool}
                <div class="tool-item">
                  <div class="tool-name">{tool.name}</div>
                  {#if tool.description}
                    <div class="tool-description">{tool.description}</div>
                  {/if}
                  <button
                    class="execute-button"
                    onclick={() => executeTool(server.id, tool.name, {})}
                  >
                    Execute
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/each}

    {#if servers.length === 0 && !loading}
      <div class="empty-state">No MCP servers configured. Add a server to get started.</div>
    {/if}
  </div>
</div>

<style>
  .mcp-server-manager {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .header h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .error {
    background: #fee;
    border: 1px solid #fcc;
    color: #c00;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .servers {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .server-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    background: #fff;
  }

  .server-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .server-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .server-info h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .server-type {
    background: #f0f0f0;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    text-transform: uppercase;
  }

  .status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status.connected {
    background: #d4edda;
    color: #155724;
  }

  .status.disconnected {
    background: #f8d7da;
    color: #721c24;
  }

  .server-actions {
    display: flex;
    gap: 0.5rem;
  }

  .server-actions button {
    padding: 0.5rem 1rem;
    border: 1px solid #007bff;
    background: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .server-actions button:hover {
    background: #0056b3;
  }

  .server-actions button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .server-detail {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #666;
  }

  .tools-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .tools-section h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
  }

  .tools-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tool-item {
    background: #f8f9fa;
    padding: 0.75rem;
    border-radius: 4px;
  }

  .tool-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .tool-description {
    font-size: 0.875rem;
    color: #666;
  }

  .execute-button {
    margin-top: 0.5rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
    background: #f8f9fa;
    border-radius: 8px;
  }

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #007bff;
    background: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #0056b3;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
