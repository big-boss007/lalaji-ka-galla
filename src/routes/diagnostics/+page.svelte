<script>
  import { transactions } from '$lib/stores/transactions.js';
  import { browser } from '$app/environment';

  let feedbackMessage = '';
  let messageIsError = false;

  /**
   * Displays a feedback message to the user.
   * @param {string} message - The message to display.
   * @param {boolean} [isError=false] - Whether the message is an error.
   */
  function showFeedback(message, isError = false) {
    feedbackMessage = message;
    messageIsError = isError;
    setTimeout(() => {
      feedbackMessage = '';
      messageIsError = false;
    }, 3000);
  }

  function createTestData() {
    const descriptions = ["Groceries", "Salary", "Rent", "Utilities", "Online Purchase", "Dinner Out", "Transport", "Miscellaneous Income", "Stationery", "Snacks", "Freelance Payment", "Stock Investment", "Mutual Fund SIP", "Tea & Coffee", "Mobile Recharge", "Internet Bill", "Books", "Gifts", "Medical Expense", "Travel Ticket"];
    const types = ['add', 'subtract'];
    
    for (let i = 0; i < 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      // Generate a base for amount, then multiply by 100
      const rawAmountMultiplier = Math.floor(Math.random() * (type === 'add' ? 500 : 100)) + 1; // For amounts from 100 up to 50000 or 10000
      const amount = rawAmountMultiplier * 100; 

      const dateOffset = Math.floor(Math.random() * 60); // Transactions in the last 60 days
      const date = new Date(Date.now() - dateOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let d500, d200, d100;
      d500 = d200 = d100 = undefined;

      // ~70% chance to add denominations for any transaction if amount > 0
      if (amount > 0 && Math.random() > 0.3) { 
          let tempAmount = amount;
          
          const calculatedD500 = Math.floor(tempAmount / 500);
          if (calculatedD500 > 0) d500 = calculatedD500;
          tempAmount %= 500;

          const calculatedD200 = Math.floor(tempAmount / 200);
          if (calculatedD200 > 0) d200 = calculatedD200;
          tempAmount %= 200;

          const calculatedD100 = Math.floor(tempAmount / 100);
          if (calculatedD100 > 0) d100 = calculatedD100;
          // tempAmount will be 0 here because original amount was a multiple of 100
      }

      transactions.addTransaction({
        date: date,
        description: `${descriptions[Math.floor(Math.random() * descriptions.length)]} #${i + 1}`,
        amount: amount,
        type: /** @type {'add' | 'subtract'} */ (type),
        denom500: d500, // Will be undefined if not calculated or zero
        denom200: d200,
        denom100: d100,
      });
    }
    showFeedback('20 test entries created successfully!');
  }

  function flushAllData() {
    if (browser) {
      if (confirm("Are you sure you want to delete ALL transaction data? This cannot be undone.")) {
        if (confirm("SECOND CONFIRMATION: Really delete everything? All data will be lost permanently.")) {
          transactions.deleteAllTransactions();
          showFeedback('All data has been flushed successfully.');
        } else {
          showFeedback('Flush data operation cancelled.', true);
        }
      } else {
        showFeedback('Flush data operation cancelled.', true);
      }
    }
  }
</script>

<svelte:head>
  <title>Diagnostics - Lalaji Ka Galla</title>
</svelte:head>

<div class="screen-title-container">
  <h1>Diagnostics</h1>
</div>

<div class="diagnostics-page-container card">
  <p>Use these tools for testing and development purposes. Be careful, actions like "Flush All Data" are irreversible.</p>

  {#if feedbackMessage}
    <div class="feedback-message" class:error={messageIsError}>
      {feedbackMessage}
    </div>
  {/if}

  <div class="actions-grid">
    <div class="action-item">
      <h3>Create Test Data</h3>
      <p>Generates 20 sample transaction entries for testing application functionality.</p>
      <button class="btn" on:click={createTestData}>Create 20 Test Entries</button>
    </div>

    <div class="action-item">
      <h3>Flush All Data</h3>
      <p>Permanently deletes all transaction data stored in the application. This action requires double confirmation.</p>
      <button class="btn btn-danger" on:click={flushAllData}>Flush All Data</button>
    </div>
  </div>
</div>

<style>
  .screen-title-container {
    text-align: center; 
    margin-top: 20px;
    margin-bottom: 20px; 
  }
  .screen-title-container h1 {
    font-size: 2rem; 
    color: #1c1c1e;
    margin: 0; 
    font-weight: 700;
  }
  .diagnostics-page-container {
    padding: 20px;
    line-height: 1.6;
  }
  .diagnostics-page-container > p {
    text-align: center;
    margin-bottom: 25px;
    font-size: 0.95rem;
    color: #555;
  }
  .actions-grid {
    display: grid;
    grid-template-columns: 1fr; /* Stack on small screens */
    gap: 20px;
    margin-top: 20px;
  }
  @media (min-width: 600px) {
    .actions-grid {
      grid-template-columns: 1fr 1fr; /* Side-by-side on larger screens */
    }
  }
  .action-item {
    border: 1px solid #e5e5ea;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    background-color: #f9f9f9;
  }
  .action-item h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2rem;
    color: #1c1c1e;
  }
  .action-item p {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 15px;
    min-height: 50px; /* Ensure consistent height for description paragraphs */
  }
  .action-item button {
    width: 100%; /* Make buttons full width of their container */
  }
  .btn-danger {
    background-color: #ff3b30; /* iOS red for destructive actions */
    color: white;
  }
  .btn-danger:hover {
    background-color: #d92c20;
  }
  .feedback-message {
    padding: 10px 15px;
    margin-bottom: 20px;
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
    background-color: #e6f9e6; /* Light green for success */
    color: #006400; /* Dark green text */
    border: 1px solid #c3e6cb;
  }
  .feedback-message.error {
    background-color: #f8d7da; /* Light red for error */
    color: #721c24; /* Dark red text */
    border: 1px solid #f5c6cb;
  }
</style>
