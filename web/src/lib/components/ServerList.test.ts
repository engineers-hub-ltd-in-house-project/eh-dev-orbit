import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte'
import ServerList from './ServerList.svelte'

describe('ServerList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('サーバー一覧を表示できること', async () => {
    // Arrange
    const mockServers = [
      {
        id: 'server1',
        name: 'Memory Server',
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
        status: 'inactive',
      },
      {
        id: 'server2',
        name: 'GitHub Server',
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        status: 'active',
      },
    ]

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ servers: mockServers }),
    })

    // Act
    render(ServerList)

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Memory Server')).toBeInTheDocument()
      expect(screen.getByText('GitHub Server')).toBeInTheDocument()
    })
  })

  it('サーバーを追加できること', async () => {
    // Arrange
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ servers: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

    render(ServerList)

    // Act
    const addButton = await screen.findByText('サーバー追加')
    await fireEvent.click(addButton)

    const nameInput = screen.getByLabelText('サーバー名')
    const commandInput = screen.getByLabelText('コマンド')
    const submitButton = screen.getByText('追加')

    await fireEvent.input(nameInput, { target: { value: 'Test Server' } })
    await fireEvent.input(commandInput, { target: { value: 'test-command' } })
    await fireEvent.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/servers'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test Server'),
        })
      )
    })
  })

  it('サーバーを削除できること', async () => {
    // Arrange
    const mockServers = [
      {
        id: 'server1',
        name: 'Test Server',
        type: 'stdio',
        command: 'test',
        status: 'inactive',
      },
    ]

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ servers: mockServers }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

    render(ServerList)

    // Act
    const deleteButton = await screen.findByLabelText('サーバー削除')
    await fireEvent.click(deleteButton)

    // Assert
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/servers/server1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  it('エラー時にメッセージを表示すること', async () => {
    // Arrange
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    // Act
    render(ServerList)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument()
    })
  })
})
