<script>
  import Navbar from '$lib/components/Navbar.svelte';
  import '../app.css'; // Assuming a global stylesheet might be created later or for resets
</script>

<svelte:head>
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#333333" />
</svelte:head>

<Navbar />
<div class="app-container">
  <main class="main-content">
    <slot />
  </main>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* Restored */
    /* flex-grow: 1; /* Removed */
    width: 100%; 
    max-width: 600px; 
    margin: 0 auto; 
    padding: 0 16px; 
  }

  .main-content {
    flex-grow: 1;
    /* Padding can be added here if needed, or within individual page containers */
  }

  /* Basic reset/global styles (can be moved to app.css) */
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    background-color: #f0f2f5; /* Consistent background for the entire app */
    color: #333;
  }

  :global(a) {
    color: inherit;
    text-decoration: none;
  }

  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }
</style>
