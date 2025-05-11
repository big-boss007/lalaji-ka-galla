<script>
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';

  let menuOpen = false;
  let isShrunk = false;
  const SHRINK_THRESHOLD = 50; // Pixels

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function handleScroll() {
    if (window.scrollY > SHRINK_THRESHOLD) {
      isShrunk = true;
    } else {
      isShrunk = false;
    }
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check in case page is already scrolled
    handleScroll(); 
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<nav class="navbar" class:shrunk={isShrunk} style="--current-navbar-height: {isShrunk ? '48px' : '60px'};">
  <div class="brand">
    <a href="/">Lalaji Ka Galla</a>
  </div>
  <button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu" aria-expanded={menuOpen}>
    <span class="hamburger-icon">☰</span>
  </button>
  <ul class="nav-links" class:open={menuOpen}>
    <li><a href="/" class:active={$page.url.pathname === '/'} on:click={() => menuOpen = false}>Home</a></li>
    <li><a href="/summary" class:active={$page.url.pathname === '/summary'} on:click={() => menuOpen = false}>Summary</a></li>
    <li><a href="/modify-entries" class:active={$page.url.pathname === '/modify-entries'} on:click={() => menuOpen = false}>Modify Entries</a></li>
    <li><a href="/about" class:active={$page.url.pathname === '/about'} on:click={() => menuOpen = false}>About</a></li>
  </ul>
</nav>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #333;
    padding: 0.8rem 1.5rem; /* Initial padding */
    color: white;
    position: sticky;
    top: 0;
    z-index: 1000;
    height: var(--initial-navbar-height, 60px); /* Default initial height */
    transition: padding 0.3s ease-in-out, height 0.3s ease-in-out;
  }

  .brand a {
    color: white;
    text-decoration: none;
    font-size: 1.4rem; /* Initial font size */
    font-weight: bold;
    transition: font-size 0.3s ease-in-out;
  }

  .brand { /* Ensure brand div itself is a flex item that can center its content */
    display: flex;
    align-items: center;
  }

  .menu-toggle {
    /* display: none; Will be set to flex in mobile view */
    background: none;
    border: none;
    color: white;
    font-size: 1.8rem; /* Base size for larger screens if it were visible */
    cursor: pointer;
    padding: 0; /* Remove padding from button, will control span */
    line-height: 1;    /* Critical for text icon centering */
    display: flex; 
    align-items: center;
    justify-content: center;
  }

  .hamburger-icon {
    display: inline-block;
    position: relative;
    top: -5px; /* Changed from 1px to -5px */
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
    .navbar {
      --initial-navbar-height: 60px; /* Define for mobile */
      --shrunk-navbar-height: 48px;  /* Define for mobile */
    }
    .navbar.shrunk {
      height: var(--shrunk-navbar-height);
      padding: 0.4rem 1.5rem; /* Reduced padding when shrunk */
      box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
    }
    .navbar.shrunk .brand a {
      font-size: 1.2rem; /* Slightly smaller font when shrunk */
    }
    .navbar.shrunk .menu-toggle {
      font-size: 1.6rem; /* Adjusted font size for shrunk state */
      /* Padding is on the span if needed, or button if span doesn't have it */
    }
    /* If .hamburger-icon needs different 'top' for shrunk state, define it here: */
    /* .navbar.shrunk .hamburger-icon { top: 0.5px; } */

    .menu-toggle { 
      display: flex; /* Ensure it's flex for mobile view */
    }

    .nav-links {
      display: none; /* Hidden by default on mobile */
      flex-direction: column;
      width: 100%;
      position: absolute;
      /* top: 60px; /* Will use CSS variable */
      left: 0;
      background-color: #333;
      padding: 1rem 0;
      text-align: center;
      top: var(--current-navbar-height, var(--initial-navbar-height)); /* Fallback to initial height */
      transition: top 0.3s ease-in-out; /* Smooth transition for menu position */
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
