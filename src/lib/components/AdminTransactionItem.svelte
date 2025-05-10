<script>
  import { transactions } from '$lib/stores/transactions.js';
  import { formatInr } from '$lib/utils/formatInr.js';
  import { formatDisplayDate } from '$lib/utils/formatDate.js';
  import { createEventDispatcher } from 'svelte';

  /**
   * @typedef {import('$lib/stores/transactions.js').Transaction} Transaction
   */

  /** @type {Transaction} */
  export let transaction;

  /** @type {number} */
  export let runningBalance; // To display the balance after this transaction

  $: formattedAmount = formatInr(transaction.amount);
  $: formattedRunningBalance = formatInr(runningBalance);
  $: amountClass = transaction.type === 'add' ? 'amount-add' : 'amount-subtract';
  $: amountPrefix = transaction.type === 'add' ? '+' : '-';

  function handleDelete() {
    if (confirm(`Are you sure you want to delete this transaction: "${transaction.description || 'Transaction'}"?`)) {
      transactions.deleteTransaction(transaction.id);
    }
  }

  const dispatch = createEventDispatcher();

  function handleEdit() {
    dispatch('edit', transaction);
  }
</script>

<li class="admin-transaction-item">
  <div class="info-group">
    <div class="details">
      <span class="description">{transaction.description || 'Transaction'}</span>
      <span class="date">{formatDisplayDate(transaction.date)}</span>
      {#if transaction.denom500 || transaction.denom200 || transaction.denom100}
        <span class="denominations">
          {#if transaction.denom500}{transaction.denom500}x₹500{/if}{#if transaction.denom500 && (transaction.denom200 || transaction.denom100)}, {/if}
          {#if transaction.denom200}{transaction.denom200}x₹200{/if}{#if transaction.denom200 && transaction.denom100}, {/if}
          {#if transaction.denom100}{transaction.denom100}x₹100{/if}
        </span>
      {/if}
    </div>
    <div class="amounts">
      <span class="amount {amountClass}">{amountPrefix}{formattedAmount}</span>
      <span class="running-balance">₹{formattedRunningBalance}</span>
    </div>
  </div>
  <div class="actions">
    <button class="btn-edit" on:click={handleEdit} aria-label="Edit transaction">Edit</button>
    <button class="btn-delete" on:click={handleDelete} aria-label="Delete transaction">Delete</button>
  </div>
</li>

<style>
  .admin-transaction-item {
    display: flex;
    flex-direction: column; /* Main direction is column */
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
    background-color: #fff;
    gap: 10px; /* Gap between info-group and actions */
  }
  .info-group {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Changed from center to flex-start */
    width: 100%; /* Take full width */
  }

  .admin-transaction-item:last-child {
    border-bottom: none;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    /* flex-grow: 1; Removed to allow amounts to take its space */
    margin-right: 10px; /* Add some space between details and amounts */
  }

  .description {
    font-weight: 500;
    color: #333;
  }

  .date {
    font-size: 0.85em;
    color: #777;
  }
  .denominations { /* Added style for denominations */
    font-size: 0.75em;
    color: #888;
    margin-top: 2px;
  }
  .id {
    font-size: 0.7em;
    color: #aaa;
  }

  .amounts {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    min-width: 120px; /* Ensure space for amounts */
  }

  .amount {
    font-weight: bold;
    font-size: 1.1em;
  }

  .amount-add {
    color: #28a745; /* Green */
  }

  .amount-subtract {
    color: #dc3545; /* Red */
  }

  .running-balance {
    font-size: 0.9em;
    color: #555;
  }
  .actions {
    display: flex;
    flex-direction: row; 
    justify-content: flex-end; /* Align buttons to the right */
    align-items: center; 
    gap: 8px; 
    padding-top: 0; /* Remove padding if no border */
    /* border-top: 1px solid #f0f0f0; Removed separator line */
    /* margin-top: 8px; Removed margin */
    width: 100%; /* Take full width */
  }
  .btn-delete, .btn-edit {
    padding: 6px 10px;
    border: 1px solid transparent; /* Keep transparent or set specific like others */
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .btn-delete {
    background-color: #ff4d4f;
    color: white;
    border-color: #ff4d4f;
  }
  .btn-delete:hover {
    background-color: #d9363e;
  }
  .btn-edit {
    background-color: #1890ff; /* Blue for edit */
    color: white;
    border-color: #1890ff;
  }
  .btn-edit:hover {
    background-color: #096dd9;
  }
</style>
