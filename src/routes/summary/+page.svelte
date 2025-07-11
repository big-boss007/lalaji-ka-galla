<script>
  import { transactions, currentBalance } from '$lib/stores/transactions.js';
  import { formatInr } from '$lib/utils/formatInr.js';
  import BalanceDisplay from '$lib/components/BalanceDisplay.svelte'; // Import BalanceDisplay

  // These will store the net effect for value calculation
  let netDenom500 = 0;
  let netDenom200 = 0;
  let netDenom100 = 0;

  // These will store non-negative quantities for bundle/loose display
  let displayDenom500 = 0;
  let displayDenom200 = 0;
  let displayDenom100 = 0;

  let bundles500 = 0;
  let loose500 = 0;
  let bundles200 = 0;
  let loose200 = 0;
  let bundles100 = 0;
  let loose100 = 0;
  
  let totalValueFromDenominations = 0;
  let totalBundlesValue = 0;
  let totalLooseNotesValue = 0;

  $: {
    netDenom500 = 0;
    netDenom200 = 0;
    netDenom100 = 0;

    $transactions.forEach(/** @param {import('$lib/stores/transactions.js').Transaction} tx */ tx => {
      const factor = tx.type === 'add' ? 1 : -1;
      if (tx.denom500 && typeof tx.denom500 === 'number') {
        netDenom500 += tx.denom500 * factor;
      }
      if (tx.denom200 && typeof tx.denom200 === 'number') {
        netDenom200 += tx.denom200 * factor;
      }
      if (tx.denom100 && typeof tx.denom100 === 'number') {
        netDenom100 += tx.denom100 * factor;
      }
    });

    // Calculate the total value based on net denominations
    totalValueFromDenominations = (netDenom500 * 500) + 
                                 (netDenom200 * 200) + 
                                 (netDenom100 * 100);

    // Determine displayable (non-negative) quantities for bundles/loose notes
    displayDenom500 = Math.max(0, netDenom500);
    displayDenom200 = Math.max(0, netDenom200);
    displayDenom100 = Math.max(0, netDenom100);

    bundles500 = Math.floor(displayDenom500 / 100);
    loose500 = displayDenom500 % 100;
    bundles200 = Math.floor(displayDenom200 / 100);
    loose200 = displayDenom200 % 100;
    bundles100 = Math.floor(displayDenom100 / 100);
    loose100 = displayDenom100 % 100;
    
    totalBundlesValue = (bundles500 * 500 * 100) + 
                        (bundles200 * 200 * 100) + 
                        (bundles100 * 100 * 100);
    
    totalLooseNotesValue = (loose500 * 500) + 
                           (loose200 * 200) + 
                           (loose100 * 100);
  }
</script>

<svelte:head>
  <title>Summary - Lalaji Ka Galla</title>
</svelte:head>

<BalanceDisplay balance={totalValueFromDenominations} />

<div class="summary-page-container card">

  <div class="denominations-summary">
    {#if displayDenom500 > 0 || displayDenom200 > 0 || displayDenom100 > 0}
      <!-- Removed the total-denominations-value div -->

      {#if bundles500 > 0 || bundles200 > 0 || bundles100 > 0}
        <div class="bundles-section">
          <h4><span>Bundles</span><span>₹{formatInr(totalBundlesValue)}</span></h4>
          <ul>
            {#if bundles500 > 0}<li><span>₹500 x {bundles500} bundles</span><span>₹{formatInr(bundles500 * 500 * 100)}</span></li>{/if}
            {#if bundles200 > 0}<li><span>₹200 x {bundles200} bundles</span><span>₹{formatInr(bundles200 * 200 * 100)}</span></li>{/if}
            {#if bundles100 > 0}<li><span>₹100 x {bundles100} bundles</span><span>₹{formatInr(bundles100 * 100 * 100)}</span></li>{/if}
          </ul>
        </div>
      {/if}

      {#if loose500 > 0 || loose200 > 0 || loose100 > 0}
        <div class="change-section">
          <h4><span>Change</span><span>₹{formatInr(totalLooseNotesValue)}</span></h4>
          <ul>
            {#if loose500 > 0}<li><span>₹500 x {loose500} notes</span><span>₹{formatInr(loose500 * 500)}</span></li>{/if}
            {#if loose200 > 0}<li><span>₹200 x {loose200} notes</span><span>₹{formatInr(loose200 * 200)}</span></li>{/if}
            {#if loose100 > 0}<li><span>₹100 x {loose100} notes</span><span>₹{formatInr(loose100 * 100)}</span></li>{/if}
          </ul>
        </div>
      {/if}
    {:else}
      <p class="no-denominations">No denominations have been recorded in transactions yet.</p>
    {/if}
  </div>
</div>

<style>
  .summary-page-container {
    padding: 20px;
    margin-top: 20px; /* Add some space below the BalanceDisplay */
    /* Uses .card style from app.css for base background/shadow/border-radius */
  }

  /* Removed .summary-page-container h2, .total-balance-section, .large-amount styles */

  .denominations-summary {
    margin-top: 20px; /* This might need adjustment if the above section is removed */
                     /* Or the summary-page-container's top margin/padding */
    max-width: 320px; /* Added to constrain width */
    margin-left: auto; /* Added to center if narrower than card */
    margin-right: auto; /* Added to center if narrower than card */
  }
  
  /* Removed .total-denominations-value and its child p/h4 styles */


  .bundles-section, .change-section {
    margin-bottom: 20px;
  }

  .bundles-section h4, .change-section h4 {
    font-size: 1.1rem;
    color: #1c1c1e;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px dashed #dcdcdc;
    display: grid; /* Added */
    grid-template-columns: 1fr auto; /* Added */
    column-gap: 10px; /* Added */
  }

  .bundles-section h4 > span:last-child,
  .change-section h4 > span:last-child {
    justify-self: end; /* Added */
  }

  .bundles-section ul, .change-section ul {
    list-style: none;
    padding-left: 0;
  }

  .bundles-section li, .change-section li {
    font-size: 1rem;
    color: #3c3c43;
    padding: 8px 0; /* Increased padding slightly for better spacing */
    display: grid; /* Changed from flex */
    grid-template-columns: 1fr auto; /* Added */
    column-gap: 10px; /* Added */
    /* justify-content: space-between; Removed */
    border-bottom: 1px solid #f0f0f0; /* Subtle separator for each line item */
  }

  .bundles-section li > span:last-child,
  .change-section li > span:last-child {
    justify-self: end; /* Added */
  }

  .bundles-section li:last-child, .change-section li:last-child {
    border-bottom: none;
  }
  
  .no-denominations {
    text-align: center;
    color: #8e8e93;
    font-style: italic;
    margin-top: 20px;
  }
</style>
