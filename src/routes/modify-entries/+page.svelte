<script>
  import { transactions } from '$lib/stores/transactions.js';
  import AdminTransactionItem from '$lib/components/AdminTransactionItem.svelte';
  import EditTransactionModal from '$lib/components/EditTransactionModal.svelte';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';

  /**
   * @typedef {import('$lib/stores/transactions.js').Transaction} Transaction
   */

  let showEditModal = false;
  /** @type {Transaction | null} */
  let transactionToEdit = null;

  const ITEMS_PER_PAGE = 6;
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

  // Reset to page 1 if transactions change significantly
  $: if ($transactions && currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  } else if ($transactions && totalPages === 0) {
    currentPage = 1;
  }

  /** @param {CustomEvent<Transaction>} event */
  function openEditModal(event) {
    transactionToEdit = event.detail;
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
    transactionToEdit = null; // Clear it after modal closes
  }

  async function downloadExcel() {
    if (!browser) return; 

    const XLSX = await import('xlsx');
    const { utils, writeFile: writeFileXLSX } = XLSX;

    const currentTransactions = get(transactions); 
    if (currentTransactions.length === 0) {
      alert('No transactions to download.');
      return;
    }

    const dataForSheet = currentTransactions.map(/** @param {Transaction} tx */ tx => ({
      Date: new Date(tx.date).toLocaleDateString('en-GB'), 
      Description: tx.description,
      Amount: tx.type === 'add' ? tx.amount : -tx.amount, 
      Type: tx.type === 'add' ? 'Credit' : 'Debit',
      ID: tx.id
    }));

    const worksheet = utils.json_to_sheet(dataForSheet);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Transactions');

    worksheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 40 }, // Description
      { wch: 15 }, // Amount
      { wch: 10 }, // Type
      { wch: 38 }  // ID
    ];

    writeFileXLSX(workbook, 'MobileLedger_Transactions.xlsx');
  }
</script>

<svelte:head>
  <title>Modify Entries - Lalaji Ka Galla</title>
</svelte:head>

<div class="admin-page-container"> 
  <h2>Modify Entries - All Transactions</h2>

  {#if allTransactionsWithRunningBalance.length === 0}
    <p class="no-transactions">No transactions recorded yet.</p>
  {:else}
    <ul class="transaction-list-admin">
      {#each paginatedTransactions as tx (tx.id)}
        <AdminTransactionItem
          transaction={tx}
          runningBalance={tx.runningBalanceAfter}
          on:edit={openEditModal}
        />
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
  <div class="download-section">
    <button class="btn-download-excel" on:click={downloadExcel}>Download as Excel</button>
  </div>
</div>

{#if showEditModal && transactionToEdit}
  <EditTransactionModal
    bind:transactionToEdit={transactionToEdit}
    on:close={closeEditModal}
  />
{/if}

<style>
  .admin-page-container { /* Keep class name for now */
    padding: 20px;
    max-width: 900px; 
    margin: 20px auto;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  h2 {
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
  }
  .transaction-list-admin {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .no-transactions {
    text-align: center;
    color: #777;
    padding: 30px 0;
    font-style: italic;
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
  }
  .btn-pagination:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  .pagination-controls span {
    font-size: 0.9rem;
    color: #555;
  }
  .download-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    text-align: center;
  }
  .btn-download-excel {
    padding: 10px 20px;
    font-size: 1rem;
    color: white;
    background-color: #007bff; 
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .btn-download-excel:hover {
    background-color: #0056b3;
  }
</style>
