<script>
  import { formatInr } from '$lib/utils/formatInr.js';
  import { formatDisplayDate } from '$lib/utils/formatDate.js';

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
</script>

<li class="transaction-item">
  <div class="details">
    <span class="description">{transaction.description || 'Transaction'}</span>
    <span class="date">{formatDisplayDate(transaction.date)}</span>
  </div>
  <div class="amounts">
    <span class="amount {amountClass}">{amountPrefix}{formattedAmount}</span>
    <span class="running-balance">₹{formattedRunningBalance}</span>
  </div>
</li>

<style>
  .transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
    background-color: #fff;
  }

  .transaction-item:last-child {
    border-bottom: none;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .description {
    font-weight: 500;
    color: #333;
  }

  .date {
    font-size: 0.85em;
    color: #777;
  }

  .amounts {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
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
</style>
