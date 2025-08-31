import { serve } from '@hono/node-server'
import { createApp } from './app'

const port = Number(process.env.PORT) || 3000
const app = createApp()

console.log(`🚀 eh-dev-orbit API server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
