import { describe, it, expect, beforeEach } from 'vitest'
import { MCPClient } from '../src/mcp-client'
import { MCPServerConfig } from '../src/mcp-server-manager'

describe('MCPClient', () => {
  let client: MCPClient

  beforeEach(() => {
    client = new MCPClient()
  })

  describe('connectToServer', () => {
    it.skip('stdio接続でサーバーに接続できること', async () => {
      const config: MCPServerConfig = {
        id: 'test-server',
        name: 'Test Server',
        type: 'stdio',
        command: 'tsx',
        args: ['test/mock-mcp-server.ts'],
        env: {},
      }

      const connection = await client.connectToServer(config)
      expect(connection).toBeDefined()
      expect(connection.serverId).toBe('test-server')
      expect(connection.transport).toBe('stdio')
      expect(connection.connected).toBe(true)

      await client.disconnectServer('test-server')
    })

    it('接続失敗時にエラーをスローすること', async () => {
      const config: MCPServerConfig = {
        id: 'invalid-server',
        name: 'Invalid Server',
        type: 'stdio',
        command: 'invalid-command',
        args: [],
        env: {},
      }

      await expect(client.connectToServer(config)).rejects.toThrow()
    })
  })

  describe('listTools', () => {
    it('未接続のサーバーでエラーをスローすること', async () => {
      await expect(client.listTools('unknown-server')).rejects.toThrow('Server not connected')
    })
  })

  describe('executeTool', () => {
    it('未接続のサーバーでエラーをスローすること', async () => {
      await expect(client.executeTool('unknown-server', 'add', { a: 1, b: 2 })).rejects.toThrow(
        'Server not connected'
      )
    })
  })

  describe('disconnectServer', () => {
    it('存在しないサーバーの切断はfalseを返すこと', async () => {
      const disconnected = await client.disconnectServer('unknown-server')
      expect(disconnected).toBe(false)
    })
  })
})
