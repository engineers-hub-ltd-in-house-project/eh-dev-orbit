import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { createApp } from '@/app'

describe('MCP Server API', () => {
  let app: Hono

  beforeEach(() => {
    app = createApp()
  })

  describe('GET /api/servers', () => {
    it('サーバー一覧を取得できること', async () => {
      const res = await app.request('/api/servers')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json).toHaveProperty('servers')
      expect(Array.isArray(json.servers)).toBe(true)
    })
  })

  describe('POST /api/servers', () => {
    it('新しいサーバーを登録できること', async () => {
      const serverConfig = {
        id: 'test-server',
        name: 'Test Server',
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
      }

      const res = await app.request('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverConfig),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json).toHaveProperty('success', true)
      expect(json).toHaveProperty('server')
      expect(json.server.id).toBe('test-server')
    })

    it('重複するIDのサーバーは登録できないこと', async () => {
      const serverConfig = {
        id: 'duplicate',
        name: 'Server 1',
        type: 'stdio',
        command: 'node',
      }

      // 1回目の登録
      await app.request('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverConfig),
      })

      // 2回目の登録（同じID）
      const res = await app.request('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...serverConfig, name: 'Server 2' }),
      })

      expect(res.status).toBe(409) // Conflict
      const json = await res.json()
      expect(json).toHaveProperty('error')
    })
  })

  describe('GET /api/servers/:id', () => {
    it('特定のサーバー情報を取得できること', async () => {
      // サーバーを登録
      const serverConfig = {
        id: 'get-test',
        name: 'Get Test Server',
        type: 'sse',
        url: 'http://localhost:3000',
      }

      await app.request('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverConfig),
      })

      // 取得
      const res = await app.request('/api/servers/get-test')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json).toHaveProperty('server')
      expect(json.server.id).toBe('get-test')
      expect(json.server.name).toBe('Get Test Server')
    })

    it('存在しないサーバーは404を返すこと', async () => {
      const res = await app.request('/api/servers/not-found')

      expect(res.status).toBe(404)
      const json = await res.json()
      expect(json).toHaveProperty('error')
    })
  })

  describe('DELETE /api/servers/:id', () => {
    it('サーバーを削除できること', async () => {
      // サーバーを登録
      const serverConfig = {
        id: 'delete-test',
        name: 'Delete Test Server',
        type: 'stdio',
        command: 'node',
      }

      await app.request('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverConfig),
      })

      // 削除
      const res = await app.request('/api/servers/delete-test', {
        method: 'DELETE',
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json).toHaveProperty('success', true)

      // 削除後は取得できないことを確認
      const getRes = await app.request('/api/servers/delete-test')
      expect(getRes.status).toBe(404)
    })
  })
})
