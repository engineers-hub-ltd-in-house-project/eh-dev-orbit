import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { MCPServerManager } from './mcp-server-manager'

const serverManager = new MCPServerManager()

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

  return app
}
