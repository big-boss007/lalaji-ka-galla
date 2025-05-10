<script>
  import { transactions } from '$lib/stores/transactions.js'; // Removed currentBalance as it's not directly used here
  import TransactionItem from './TransactionItem.svelte';

  const ITEMS_PER_PAGE = 6; // Changed from 10 to 6
  let currentPage = 1;

  // Reactive calculation of all transactions with running balances
  $: allTransactionsWithRunningBalance = (() => {
    const reversedTransactions = [...$transactions].reverse(); // Oldest first for calculation
    let runningBal = 0;
    const processed = reversedTransactions.map(tx => {
      if (tx.type === 'add') {
        runningBal += tx.amount;
      } else {
        runningBal -= tx.amount;
      }
      return { ...tx, runningBalanceAfter: runningBal };
    });
    return processed.reverse(); // Reverse back to newest first for display
  })();

  // Reactive calculation for paginated transactions
  $: paginatedTransactions = (() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allTransactionsWithRunningBalance.slice(startIndex, endIndex);
  })();

  $: totalPages = Math.ceil(allTransactionsWithRunningBalance.length / ITEMS_PER_PAGE);

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }

  // Reset to page 1 if transactions change significantly (e.g., a delete makes current page invalid)
  $: if ($transactions && currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  } else if ($transactions && totalPages === 0) {
    currentPage = 1;
  }

</script>

<div class="tracker-section">
  <h3>Recent Transactions</h3>
  {#if allTransactionsWithRunningBalance.length === 0}
    <p class="no-transactions">No transactions yet. Add one above!</p>
  {:else}
    <ul class="transaction-list">
      {#each paginatedTransactions as tx (tx.id)}
        <TransactionItem transaction={tx} runningBalance={tx.runningBalanceAfter} />
      {/each}
    </ul>
    {#if totalPages > 1}
      <div class="pagination-controls">
        <button class="btn-pagination" on:click={prevPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button class="btn-pagination" on:click={nextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .tracker-section {
    margin-top: 30px;
    padding: 15px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  .tracker-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.25rem;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  .transaction-list {
    list-style: none;
    padding: 0;
    margin: 0;
    /* max-height: 400px; Removed fixed height for pagination */
    /* overflow-y: auto; */
  }

  .no-transactions {
    text-align: center;
    color: #777;
    padding: 20px 0;
  }
  .pagination-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
  }
  .btn-pagination {
    padding: 8px 12px;
    font-size: 0.9rem;
    /* Uses global button styles from app.css but can be overridden */
  }
  .btn-pagination:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  .pagination-controls span {
    font-size: 0.9rem;
    color: #555;
  }
</style>
