import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import MCPServerManager from './MCPServerManager.svelte'

describe('MCPServerManager', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('MCP サーバー一覧を表示すること', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        servers: [
          {
            id: 'server1',
            name: 'Test Server 1',
            type: 'stdio',
            command: 'node',
            args: ['server1.js'],
          },
          {
            id: 'server2',
            name: 'Test Server 2',
            type: 'sse',
            url: 'http://localhost:3001',
          },
        ],
      }),
    })

    const { getByText } = render(MCPServerManager)

    await waitFor(() => {
      expect(getByText('Test Server 1')).toBeInTheDocument()
      expect(getByText('Test Server 2')).toBeInTheDocument()
    })
  })

  it('サーバーに接続できること', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          servers: [
            {
              id: 'server1',
              name: 'Test Server',
              type: 'stdio',
              command: 'node',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connected: false,
          serverId: 'server1',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connected: true,
          serverId: 'server1',
        }),
      })

    const { getByText } = render(MCPServerManager)

    await waitFor(() => {
      expect(getByText('Test Server')).toBeInTheDocument()
      expect(getByText('Connect')).toBeInTheDocument()
    })

    const connectButton = getByText('Connect')
    await fireEvent.click(connectButton)

    await waitFor(() => {
      expect(getByText('Disconnect')).toBeInTheDocument()
    })
  })

  it('ツール一覧を表示できること', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          servers: [
            {
              id: 'server1',
              name: 'Test Server',
              type: 'stdio',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connected: true,
          serverId: 'server1',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tools: [
            {
              name: 'add',
              description: 'Add two numbers',
            },
            {
              name: 'multiply',
              description: 'Multiply two numbers',
            },
          ],
        }),
      })

    const { getByText } = render(MCPServerManager)

    await waitFor(() => {
      expect(getByText('Test Server')).toBeInTheDocument()
      expect(getByText('View Tools')).toBeInTheDocument()
    })

    const viewToolsButton = getByText('View Tools')
    await fireEvent.click(viewToolsButton)

    await waitFor(() => {
      expect(getByText('add')).toBeInTheDocument()
      expect(getByText('multiply')).toBeInTheDocument()
    })
  })
})
