import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { MCPServerManager } from './mcp-server-manager'
import { MCPClient } from './mcp-client'

const serverManager = new MCPServerManager()
const mcpClient = new MCPClient()

export function createApp() {
  const app = new Hono()

  // Middleware
  app.use('*', cors())
  app.use('*', logger())

  // Health check
  app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Server management endpoints
  app.get('/api/servers', (c) => {
    const servers = serverManager.listServers()
    return c.json({ servers })
  })

  app.post('/api/servers', async (c) => {
    const body = await c.req.json()

    // バリデーション
    if (!body.id || !body.name || !body.type) {
      return c.json({ error: 'Missing required fields: id, name, type' }, 400)
    }

    const success = serverManager.registerServer(body)

    if (!success) {
      return c.json({ error: 'Server with this ID already exists' }, 409)
    }

    return c.json(
      {
        success: true,
        server: serverManager.getServer(body.id),
      },
      201
    )
  })

  app.get('/api/servers/:id', (c) => {
    const id = c.req.param('id')
    const server = serverManager.getServer(id)

    if (!server) {
      return c.json({ error: 'Server not found' }, 404)
    }

    return c.json({ server })
  })

  app.put('/api/servers/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()

    const success = serverManager.updateServer(id, body)

    if (!success) {
      return c.json({ error: 'Server not found' }, 404)
    }

    return c.json({
      success: true,
      server: serverManager.getServer(id),
    })
  })

  app.delete('/api/servers/:id', (c) => {
    const id = c.req.param('id')
    const success = serverManager.removeServer(id)

    if (!success) {
      return c.json({ error: 'Server not found' }, 404)
    }

    return c.json({ success: true })
  })

  // MCP Connection endpoints
  app.post('/api/servers/:id/connect', async (c) => {
    const id = c.req.param('id')
    const server = serverManager.getServer(id)

    if (!server) {
      return c.json({ error: 'Server not found' }, 404)
    }

    try {
      const connection = await mcpClient.connectToServer(server)
      return c.json({
        connected: connection.connected,
        serverId: connection.serverId,
        transport: connection.transport,
      })
    } catch (error) {
      return c.json({ error: `Failed to connect: ${error}` }, 500)
    }
  })

  app.post('/api/servers/:id/disconnect', async (c) => {
    const id = c.req.param('id')

    try {
      const disconnected = await mcpClient.disconnectServer(id)
      return c.json({ disconnected })
    } catch (error) {
      return c.json({ error: `Failed to disconnect: ${error}` }, 500)
    }
  })

  app.get('/api/servers/:id/status', async (c) => {
    const id = c.req.param('id')
    const server = serverManager.getServer(id)

    if (!server) {
      return c.json({ error: 'Server not found' }, 404)
    }

    // Check if connected
    try {
      await mcpClient.listTools(id)
      return c.json({ connected: true, serverId: id })
    } catch {
      return c.json({ connected: false, serverId: id })
    }
  })

  app.get('/api/servers/:id/tools', async (c) => {
    const id = c.req.param('id')

    try {
      const tools = await mcpClient.listTools(id)
      return c.json({ tools })
    } catch (error) {
      return c.json({ error: `Failed to list tools: ${error}` }, 500)
    }
  })

  app.post('/api/servers/:id/tools/:toolName', async (c) => {
    const id = c.req.param('id')
    const toolName = c.req.param('toolName')
    const args = await c.req.json()

    try {
      const result = await mcpClient.executeTool(id, toolName, args)
      return c.json({ result })
    } catch (error) {
      return c.json({ error: `Failed to execute tool: ${error}` }, 500)
    }
  })

  return app
}
