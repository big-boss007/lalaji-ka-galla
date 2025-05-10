<script>
  import { page } from '$app/stores';
  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<nav class="navbar">
  <div class="brand">
    <a href="/">Lalaji Ka Galla</a>
  </div>
  <button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu" aria-expanded={menuOpen}>
    ☰
  </button>
  <ul class="nav-links" class:open={menuOpen}>
    <li><a href="/" class:active={$page.url.pathname === '/'} on:click={() => menuOpen = false}>Home</a></li>
    <li><a href="/modify-entries" class:active={$page.url.pathname === '/modify-entries'} on:click={() => menuOpen = false}>Modify Entries</a></li>
  </ul>
</nav>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #333;
    padding: 0.8rem 1.5rem;
    color: white;
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .brand a {
    color: white;
    text-decoration: none;
    font-size: 1.4rem;
    font-weight: bold;
  }

  .menu-toggle {
    display: none; /* Hidden by default, shown on small screens */
    background: none;
    border: none;
    color: white;
    font-size: 1.8rem;
    cursor: pointer;
  }

  .nav-links {
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;
  }

  .nav-links li {
    margin-left: 20px;
  }

  .nav-links a {
    color: white;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem 0;
    transition: color 0.2s ease-in-out;
  }

  .nav-links a:hover,
  .nav-links a.active {
    color: #64ffda; /* Accent color for hover/active */
    border-bottom: 2px solid #64ffda;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .menu-toggle {
      display: block;
    }

    .nav-links {
      display: none; /* Hidden by default on mobile */
      flex-direction: column;
      width: 100%;
      position: absolute;
      top: 60px; /* Adjust based on navbar height */
      left: 0;
      background-color: #333;
      padding: 1rem 0;
      text-align: center;
    }

    .nav-links.open {
      display: flex; /* Show when menuOpen is true */
    }

    .nav-links li {
      margin: 0;
      width: 100%;
    }
    .nav-links li a {
      display: block;
      padding: 1rem;
      width: 100%;
      border-bottom: 1px solid #444;
    }
    .nav-links li:last-child a {
      border-bottom: none;
    }
    .nav-links a:hover,
    .nav-links a.active {
      background-color: #444;
      border-bottom: none; /* Remove bottom border for mobile active/hover */
    }
  }
</style>
