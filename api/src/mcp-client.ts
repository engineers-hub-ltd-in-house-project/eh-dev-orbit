import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { ChildProcess } from 'child_process'
import { MCPServerConfig } from './mcp-server-manager'

export interface MCPConnection {
  serverId: string
  transport: 'stdio' | 'sse'
  connected: boolean
  client?: Client
  process?: ChildProcess
}

export interface MCPTool {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
}

export interface MCPToolResult {
  content: Array<{
    type: string
    text?: string
    data?: unknown
  }>
}

export class MCPClient {
  private connections: Map<string, MCPConnection> = new Map()

  async connectToServer(config: MCPServerConfig): Promise<MCPConnection> {
    if (this.connections.has(config.id)) {
      const existing = this.connections.get(config.id)!
      if (existing.connected) {
        return existing
      }
    }

    try {
      const transport = new StdioClientTransport({
        command: config.command!,
        args: config.args || [],
        env: { ...process.env, ...config.env },
      })

      const client = new Client({
        name: `eh-dev-orbit-client-${config.id}`,
        version: '1.0.0',
      })

      await client.connect(transport)

      const connection: MCPConnection = {
        serverId: config.id,
        transport: 'stdio',
        connected: true,
        client,
      }

      this.connections.set(config.id, connection)
      return connection
    } catch (error) {
      throw new Error(`Failed to connect to server ${config.id}: ${error}`)
    }
  }

  async listTools(serverId: string): Promise<MCPTool[]> {
    const connection = this.connections.get(serverId)
    if (!connection || !connection.connected) {
      throw new Error('Server not connected')
    }

    if (!connection.client) {
      return []
    }

    try {
      const response = await connection.client.listTools()
      return response.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }))
    } catch (error) {
      throw new Error(`Failed to list tools: ${error}`)
    }
  }

  async executeTool(
    serverId: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<MCPToolResult> {
    const connection = this.connections.get(serverId)
    if (!connection || !connection.connected) {
      throw new Error('Server not connected')
    }

    if (!connection.client) {
      throw new Error('Client not initialized')
    }

    try {
      const response = await connection.client.callTool({
        name: toolName,
        arguments: args,
      })

      return {
        content: response.content,
      }
    } catch (error) {
      throw new Error(`Failed to execute tool ${toolName}: ${error}`)
    }
  }

  async disconnectServer(serverId: string): Promise<boolean> {
    const connection = this.connections.get(serverId)
    if (!connection) {
      return false
    }

    try {
      if (connection.client) {
        await connection.client.close()
      }

      if (connection.process) {
        connection.process.kill()
      }

      this.connections.delete(serverId)
      return true
    } catch (error) {
      console.error(`Error disconnecting from server ${serverId}:`, error)
      return false
    }
  }

  async disconnectAll(): Promise<void> {
    const serverIds = Array.from(this.connections.keys())
    await Promise.all(serverIds.map((id) => this.disconnectServer(id)))
  }
}
