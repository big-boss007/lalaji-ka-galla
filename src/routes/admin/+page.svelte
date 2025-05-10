<script>
  import { transactions } from '$lib/stores/transactions.js';
  import AdminTransactionItem from '$lib/components/AdminTransactionItem.svelte';
  import EditTransactionModal from '$lib/components/EditTransactionModal.svelte';
  // import XLSX from 'xlsx'; // Defer import
  import { get } from 'svelte/store'; // To get current value of store
  import { browser } from '$app/environment';


  /**
   * @typedef {import('$lib/stores/transactions.js').Transaction} Transaction
   */

  let showEditModal = false;
  /** @type {Transaction | null} */
  let transactionToEdit = null;

  // Reactive calculation of transactions with running balances
  $: transactionsWithRunningBalance = (() => {
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
    if (!browser) return; // Should not be called on server, but as a safeguard

    const XLSX = await import('xlsx');
    const { utils, writeFile: writeFileXLSX } = XLSX;

    const currentTransactions = get(transactions); // Get current transactions from the store
    if (currentTransactions.length === 0) {
      alert('No transactions to download.');
      return;
    }

    // Prepare data for worksheet: map to desired format, ensure correct order of columns
    const dataForSheet = currentTransactions.map(/** @param {Transaction} tx */ tx => ({
      Date: new Date(tx.date).toLocaleDateString('en-GB'), // Format date
      Description: tx.description,
      Amount: tx.type === 'add' ? tx.amount : -tx.amount, // Represent subtractions as negative
      Type: tx.type === 'add' ? 'Credit' : 'Debit',
      ID: tx.id
    }));

    const worksheet = utils.json_to_sheet(dataForSheet);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Set column widths (optional, but improves readability)
    // Based on typical content length. 'wch' unit is character width.
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
  <title>Admin - Mobile Ledger</title>
</svelte:head>

<div class="admin-page-container">
  <h2>Admin Section - All Transactions</h2>

  {#if transactionsWithRunningBalance.length === 0}
    <p class="no-transactions">No transactions recorded yet.</p>
  {:else}
    <ul class="transaction-list-admin">
      {#each transactionsWithRunningBalance as tx (tx.id)}
        <AdminTransactionItem
          transaction={tx}
          runningBalance={tx.runningBalanceAfter}
          on:edit={openEditModal}
        />
      {/each}
    </ul>
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
  .admin-page-container {
    padding: 20px;
    max-width: 900px; /* Wider for admin view */
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
    background-color: #007bff; /* Bootstrap primary blue */
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .btn-download-excel:hover {
    background-color: #0056b3;
  }
</style>
