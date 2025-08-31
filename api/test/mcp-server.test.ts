import { describe, it, expect } from 'vitest'
import { MCPServerManager } from '@/mcp-server-manager'

describe('MCPServerManager', () => {
  describe('サーバー管理', () => {
    it('MCPサーバーを登録できること', () => {
      // Arrange
      const manager = new MCPServerManager()
      const serverConfig = {
        id: 'test-server',
        name: 'Test MCP Server',
        type: 'stdio' as const,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
      }

      // Act
      const result = manager.registerServer(serverConfig)

      // Assert
      expect(result).toBe(true)
      expect(manager.getServer('test-server')).toEqual(serverConfig)
    })

    it('登録されたサーバーの一覧を取得できること', () => {
      // Arrange
      const manager = new MCPServerManager()
      const server1 = {
        id: 'server1',
        name: 'Server 1',
        type: 'stdio' as const,
        command: 'node',
        args: ['server1.js'],
      }
      const server2 = {
        id: 'server2',
        name: 'Server 2',
        type: 'sse' as const,
        url: 'http://localhost:3001',
      }

      // Act
      manager.registerServer(server1)
      manager.registerServer(server2)
      const servers = manager.listServers()

      // Assert
      expect(servers).toHaveLength(2)
      expect(servers).toContainEqual(server1)
      expect(servers).toContainEqual(server2)
    })
  })
})
