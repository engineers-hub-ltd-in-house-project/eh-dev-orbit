<script lang="ts">
  import ServerList from './lib/components/ServerList.svelte'
</script>

<main>
  <header>
    <h1>🌐 eh-dev-orbit</h1>
    <p>MCP Server Management Platform</p>
  </header>

  <ServerList />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
      'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  header {
    text-align: center;
    color: white;
    margin-bottom: 40px;
    padding: 40px 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }

  header h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  header p {
    margin: 10px 0 0;
    font-size: 1.2rem;
    opacity: 0.9;
  }
</style>
