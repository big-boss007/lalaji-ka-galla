<script>
  import { currentBalance } from '$lib/stores/transactions.js';
  import { formatInr } from '$lib/utils/formatInr.js';

  // Reactive declaration for the formatted balance
  $: formattedBalance = formatInr($currentBalance);
</script>

<div class="balance-display">
  <span class="currency-symbol">₹</span>
  <span class="amount">{formattedBalance}</span>
</div>

<style>
  .balance-display {
    font-size: 2.5rem; /* Large font for prominence */
    font-weight: bold;
    color: #333; /* Dark grey for good contrast */
    text-align: center;
    padding: 20px 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee; /* Subtle separator */
  }

  .currency-symbol {
    margin-right: 5px;
    font-weight: normal;
    color: #555;
  }

  .amount {
    letter-spacing: 0.5px; /* Slight spacing for readability */
  }
</style>
