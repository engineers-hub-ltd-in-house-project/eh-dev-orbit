export type MCPServerType = 'stdio' | 'sse' | 'http'

export interface MCPServerConfig {
  id: string
  name: string
  type: MCPServerType
  command?: string
  args?: string[]
  url?: string
  headers?: Record<string, string>
  env?: Record<string, string>
}

export class MCPServerManager {
  private servers: Map<string, MCPServerConfig> = new Map()

  registerServer(config: MCPServerConfig): boolean {
    if (this.servers.has(config.id)) {
      return false
    }
    this.servers.set(config.id, config)
    return true
  }

  getServer(id: string): MCPServerConfig | undefined {
    return this.servers.get(id)
  }

  listServers(): MCPServerConfig[] {
    return Array.from(this.servers.values())
  }

  removeServer(id: string): boolean {
    return this.servers.delete(id)
  }

  updateServer(id: string, config: Partial<MCPServerConfig>): boolean {
    const existing = this.servers.get(id)
    if (!existing) {
      return false
    }
    const updated = { ...existing, ...config, id } // id は変更不可
    this.servers.set(id, updated)
    return true
  }

  clearServers(): void {
    this.servers.clear()
  }
}
