# eh-dev-orbit

MCP (Model Context Protocol) server management platform

## Overview

eh-dev-orbit is a platform for managing multiple MCP servers. Inspired by Dev Genius concepts, it will expand beyond MCP servers to become a comprehensive developer support tool.

## Tech Stack

- API: Node.js + TypeScript + Hono
- Web: Svelte 5 + TypeScript + Vite
- Testing: Vitest (TDD with Kent Beck methodology)
- Future: Docker, MCP SDK integration

## Project Structure

```
eh-dev-orbit/
├── api/
│   ├── src/
│   │   ├── app.ts
│   │   ├── mcp-server-manager.ts
│   │   └── index.ts
│   └── test/
├── web/
│   ├── src/
│   │   ├── App.svelte
│   │   └── lib/components/
│   └── test/
└── docker/
```

## Development

### API Server

```bash
cd api
npm install
npm run dev     # Start dev server (http://localhost:3000)
npm test        # Run tests
npm test:watch  # Test watch mode
```

### Web Frontend

```bash
cd web
npm install
npm run dev     # Start dev server (http://localhost:5173)
npm test        # Run tests
npm test:ui     # Vitest UI
```

## API Endpoints

- GET /api/servers - List servers
- POST /api/servers - Add server
- GET /api/servers/:id - Get server details
- PUT /api/servers/:id - Update server
- DELETE /api/servers/:id - Delete server

## TDD Development Flow

1. Red: Write test first
2. Green: Write minimal code to pass
3. Refactor: Clean up code

## Roadmap

- [ ] MCP SDK integration for server execution
- [ ] Real-time status monitoring
- [ ] Process management (start/stop)
- [ ] Log viewer
- [ ] Docker support
- [ ] Authentication
- [ ] WebSocket/SSE support

## License

MIT
