import { Server } from '@modelcontextprotocol/sdk/server/index.js'

export async function createMockMCPServer() {
  const server = new Server(
    {
      name: 'mock-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  server.setRequestHandler('tools/list', async () => ({
    tools: [
      {
        name: 'add',
        description: 'Add two numbers',
        inputSchema: {
          type: 'object',
          properties: {
            a: { type: 'number' },
            b: { type: 'number' },
          },
          required: ['a', 'b'],
        },
      },
      {
        name: 'echo',
        description: 'Echo a message',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
      },
    ],
  }))

  server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params

    if (name === 'add') {
      const result = args.a + args.b
      return {
        content: [{ type: 'text', text: String(result) }],
      }
    }

    if (name === 'echo') {
      return {
        content: [{ type: 'text', text: args.message }],
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  })

  return server
}

// Run as standalone server if executed directly
// Note: This file is for testing purposes only
