import { describe, it, expect, beforeEach } from 'vitest'
import { createApp } from '../src/app'

describe('MCP API Endpoints', () => {
  const app = createApp()

  beforeEach(async () => {
    // Register a test server
    await app.request('/api/servers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'test-server',
        name: 'Test MCP Server',
        type: 'stdio',
        command: 'echo',
        args: ['test'],
      }),
    })
  })

  describe('POST /api/servers/:id/connect', () => {
    it('存在しないサーバーへの接続は404を返すこと', async () => {
      const response = await app.request('/api/servers/nonexistent/connect', {
        method: 'POST',
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Server not found')
    })
  })

  describe('POST /api/servers/:id/disconnect', () => {
    it('未接続サーバーの切断はfalseを返すこと', async () => {
      const response = await app.request('/api/servers/test-server/disconnect', {
        method: 'POST',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('disconnected', false)
    })
  })

  describe('GET /api/servers/:id/tools', () => {
    it('未接続サーバーのツール一覧取得はエラーを返すこと', async () => {
      const response = await app.request('/api/servers/test-server/tools')

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Failed to list tools')
    })
  })

  describe('POST /api/servers/:id/tools/:toolName', () => {
    it('未接続サーバーのツール実行はエラーを返すこと', async () => {
      const response = await app.request('/api/servers/test-server/tools/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ a: 1, b: 2 }),
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Failed to execute tool')
    })
  })

  describe('GET /api/servers/:id/status', () => {
    it('サーバーの接続状態を取得できること', async () => {
      const response = await app.request('/api/servers/test-server/status')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('connected', false)
      expect(data).toHaveProperty('serverId', 'test-server')
    })
  })
})
