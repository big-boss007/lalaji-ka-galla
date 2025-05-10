<script>
  import BalanceDisplay from '$lib/components/BalanceDisplay.svelte';
  import TransactionForm from '$lib/components/TransactionForm.svelte';
  import TrackerSection from '$lib/components/TrackerSection.svelte';
</script>

<svelte:head>
  <title>Lalaji Ka Galla - Home</title>
  <meta name="description" content="A simple mobile ledger named Lalaji Ka Galla for tracking INR transactions." />
</svelte:head>

<div class="home-screen-container">
  <!-- <header>
    <h1>Mobile Ledger</h1>
  </header> -->

  <main>
    <BalanceDisplay />
    <TransactionForm />
    <TrackerSection />
  </main>

  <footer>
    <p>&copy; {new Date().getFullYear()} Lalaji Ka Galla Solutions</p>
  </footer>
</div>

<style>
  .home-screen-container {
    max-width: 600px; /* Max width for a mobile-like view on larger screens */
    margin: 0 auto;
    padding: 15px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f0f2f5; /* Light grey background for the page */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  main {
    flex-grow: 1;
  }

  footer {
    text-align: center;
    padding: 20px 0;
    margin-top: 30px;
    font-size: 0.85em;
    color: #8e8e93; /* Apple-like medium grey */
  }
</style>
