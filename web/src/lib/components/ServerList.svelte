<script lang="ts">
  interface MCPServer {
    id: string
    name: string
    type: 'stdio' | 'sse' | 'http'
    command?: string
    args?: string[]
    url?: string
    status: 'active' | 'inactive'
  }

  let servers: MCPServer[] = []
  let loading = true
  let error: string | null = null
  let showAddForm = false

  // Add form state
  let newServer = {
    name: '',
    type: 'stdio' as const,
    command: '',
    args: [] as string[],
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  async function loadServers() {
    try {
      loading = true
      error = null
      const response = await fetch(`${API_URL}/api/servers`)
      if (!response.ok) throw new Error('Failed to load servers')
      const data = await response.json()
      servers = data.servers
    } catch (err) {
      error = 'エラーが発生しました: ' + (err as Error).message
    } finally {
      loading = false
    }
  }

  async function addServer() {
    try {
      const serverId = `server-${Date.now()}`
      const response = await fetch(`${API_URL}/api/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serverId,
          name: newServer.name,
          type: newServer.type,
          command: newServer.command,
          args: newServer.args,
          status: 'inactive',
        }),
      })

      if (!response.ok) throw new Error('Failed to add server')

      await loadServers()
      showAddForm = false
      newServer = { name: '', type: 'stdio', command: '', args: [] }
    } catch (err) {
      error = 'サーバー追加に失敗しました: ' + (err as Error).message
    }
  }

  async function deleteServer(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/servers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete server')

      await loadServers()
    } catch (err) {
      error = 'サーバー削除に失敗しました: ' + (err as Error).message
    }
  }

  // Load servers on component initialization
  loadServers()
</script>

<div class="container">
  <h2>MCPサーバー管理</h2>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <p>読み込み中...</p>
  {:else}
    <div class="server-list">
      {#if servers.length === 0}
        <p>サーバーが登録されていません</p>
      {:else}
        {#each servers as server}
          <div class="server-card">
            <div class="server-info">
              <h3>{server.name}</h3>
              <p class="server-type">タイプ: {server.type}</p>
              {#if server.command}
                <p class="server-command">コマンド: {server.command}</p>
              {/if}
              {#if server.url}
                <p class="server-url">URL: {server.url}</p>
              {/if}
              <span class="status status-{server.status}">
                {server.status === 'active' ? 'アクティブ' : '停止中'}
              </span>
            </div>
            <div class="server-actions">
              <button
                aria-label="サーバー削除"
                on:click={() => deleteServer(server.id)}
                class="btn-delete"
              >
                削除
              </button>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    {#if showAddForm}
      <div class="add-form">
        <h3>新規サーバー追加</h3>
        <form on:submit|preventDefault={addServer}>
          <div class="form-group">
            <label for="server-name">サーバー名</label>
            <input id="server-name" type="text" bind:value={newServer.name} required />
          </div>

          <div class="form-group">
            <label for="server-type">タイプ</label>
            <select id="server-type" bind:value={newServer.type}>
              <option value="stdio">stdio</option>
              <option value="sse">SSE</option>
              <option value="http">HTTP</option>
            </select>
          </div>

          <div class="form-group">
            <label for="server-command">コマンド</label>
            <input id="server-command" type="text" bind:value={newServer.command} />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">追加</button>
            <button type="button" on:click={() => (showAddForm = false)} class="btn-secondary">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    {:else}
      <button on:click={() => (showAddForm = true)} class="btn-primary"> サーバー追加 </button>
    {/if}
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  h2 {
    color: #333;
    margin-bottom: 20px;
  }

  .error {
    background-color: #fee;
    color: #c00;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .server-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }

  .server-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .server-info h3 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .server-info p {
    margin: 5px 0;
    color: #666;
    font-size: 14px;
  }

  .status {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    margin-top: 5px;
  }

  .status-active {
    background-color: #d4edda;
    color: #155724;
  }

  .status-inactive {
    background-color: #f8d7da;
    color: #721c24;
  }

  .add-form {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    color: #333;
    font-weight: 500;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .btn-primary,
  .btn-secondary,
  .btn-delete {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background-color: #0056b3;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #545b62;
  }

  .btn-delete {
    background-color: #dc3545;
    color: white;
  }

  .btn-delete:hover {
    background-color: #c82333;
  }
</style>
