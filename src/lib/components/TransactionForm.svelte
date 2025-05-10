<script>
  import { transactions } from '$lib/stores/transactions.js';

  let amountInput = ''; // Store raw input for amount
  let date = new Date().toISOString().split('T')[0]; // Default to today
  let description = '';
  let formError = '';
  let denominationError = '';

  let denom500Qty = '';
  let denom200Qty = '';
  let denom100Qty = '';

  // $: console.log({ amountInput, denom500Qty, denom200Qty, denom100Qty });


  /**
   * Calculates denomination quantities based on total amount or a fixed denomination.
   * @param {number} totalAmount The total amount to denominate.
   * @param {500 | 200 | 100 | null} [fixedDenom=null] The denomination that was manually changed by user.
   * @param {number} [fixedQty=0] The quantity manually set for the fixedDenom.
   */
  function autoCalculateDenominations(totalAmount, fixedDenom = null, fixedQty = 0) {
    if (isNaN(totalAmount) || totalAmount <= 0) {
      denom500Qty = '';
      denom200Qty = '';
      denom100Qty = '';
      validateDenominations();
      return;
    }

    let remainingAmount = totalAmount;
    let d500 = 0;
    let d200 = 0;
    let d100 = 0;

    if (fixedDenom === 500) {
      d500 = fixedQty;
      remainingAmount -= d500 * 500;
      if (remainingAmount < 0) remainingAmount = 0; // Cannot have negative remainder
      
      d200 = Math.floor(remainingAmount / 200);
      remainingAmount %= 200;
      d100 = Math.floor(remainingAmount / 100);
    } else if (fixedDenom === 200) {
      // If 200 is fixed, 500 must have been set prior or is 0
      d500 = parseInt(String(denom500Qty)) || 0; // Keep existing 500 qty
      remainingAmount -= d500 * 500;
      if (remainingAmount < 0) remainingAmount = 0;

      d200 = fixedQty;
      remainingAmount -= d200 * 200;
      if (remainingAmount < 0) remainingAmount = 0;
      
      d100 = Math.floor(remainingAmount / 100);
    } else if (fixedDenom === 100) {
      // If 100 is fixed, 500 and 200 must have been set
      d500 = parseInt(String(denom500Qty)) || 0;
      d200 = parseInt(String(denom200Qty)) || 0;
      remainingAmount -= (d500 * 500) + (d200 * 200);
      if (remainingAmount < 0) remainingAmount = 0;
      
      d100 = fixedQty; // User sets this directly
    } else { // Initial calculation or main amount changed
      d500 = Math.floor(remainingAmount / 500);
      remainingAmount %= 500;
      d200 = Math.floor(remainingAmount / 200);
      remainingAmount %= 200;
      d100 = Math.floor(remainingAmount / 100);
    }
    
    denom500Qty = d500 > 0 ? String(d500) : '';
    denom200Qty = d200 > 0 ? String(d200) : '';
    denom100Qty = d100 > 0 ? String(d100) : '';
    
    validateDenominations();
  }

  function validateDenominations() {
    const mainAmount = parseFloat(amountInput.replace(/,/g, '')) || 0;
    if (mainAmount === 0 && denom500Qty === '' && denom200Qty === '' && denom100Qty === '') {
      denominationError = ''; // No error if everything is empty/zero
      return;
    }

    const d500Val = (parseInt(String(denom500Qty)) || 0) * 500;
    const d200Val = (parseInt(String(denom200Qty)) || 0) * 200;
    const d100Val = (parseInt(String(denom100Qty)) || 0) * 100;
    const denominationSum = d500Val + d200Val + d100Val;

    if (denominationSum !== mainAmount) {
      denominationError = `Denominations sum (₹${denominationSum.toLocaleString('en-IN')}) does not match Amount (₹${mainAmount.toLocaleString('en-IN')}).`;
    } else {
      denominationError = '';
    }
  }
  
  $: if (amountInput) { // React to changes in main amount input
      const mainAmountNum = parseFloat(amountInput.replace(/,/g, '')) || 0;
      // Only auto-calculate if not currently focused on a denom field to avoid loops
      // This simple check might not be enough, might need a more robust flag
      if (typeof document !== 'undefined' && document.activeElement && !['denom500', 'denom200', 'denom100'].includes(document.activeElement.id)) {
        autoCalculateDenominations(mainAmountNum);
      } else if (typeof document === 'undefined' || !document.activeElement) { // For initial load or non-interactive changes
        autoCalculateDenominations(mainAmountNum);
      }
  } else { // If amountInput is cleared
    autoCalculateDenominations(0);
  }

  /**
   * Handles changes to denomination input fields.
   * @param {500 | 200 | 100} denomType The denomination type that changed.
   */
  function handleDenomChange(denomType) {
    const mainAmountNum = parseFloat(amountInput.replace(/,/g, '')) || 0;
    if (denomType === 500) {
      autoCalculateDenominations(mainAmountNum, 500, parseInt(String(denom500Qty)) || 0);
    } else if (denomType === 200) {
      autoCalculateDenominations(mainAmountNum, 200, parseInt(String(denom200Qty)) || 0);
    } else if (denomType === 100) {
      // For 100, we just validate as it's the last in chain
      validateDenominations();
    }
  }

  /**
   * Resets a specific denomination field and triggers recalculation.
   * @param {500 | 200 | 100} denomToReset The denomination value to reset.
   */
  function resetSpecificDenomination(denomToReset) {
    const mainAmountNum = parseFloat(amountInput.replace(/,/g, '')) || 0;

    if (denomToReset === 500) {
      denom500Qty = '';
      autoCalculateDenominations(mainAmountNum, 500, 0); 
    } else if (denomToReset === 200) {
      denom200Qty = '';
      autoCalculateDenominations(mainAmountNum, 200, 0);
    } else if (denomToReset === 100) {
      denom100Qty = '';
      validateDenominations(); // Just validate, no further downward recalculation
    }
  }

  function handleAdd() {
    handleSubmit('add');
  }

  function handleSubtract() {
    handleSubmit('subtract');
  }

  /**
   * Handles the submission of the transaction.
   * @param {'add' | 'subtract'} type - The type of transaction.
   */
  function handleSubmit(type) {
    formError = ''; // Reset error
    validateDenominations(); // Final validation check

    if (denominationError) {
      formError = denominationError; // Show denomination error prominently
      return;
    }

    const parsedAmount = parseFloat(amountInput.replace(/,/g, ''));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      formError = 'Please enter a valid positive amount for the main Amount field.';
      return;
    }
    
    // Ensure denomination fields are numbers or undefined
    const d500 = denom500Qty !== '' ? parseInt(String(denom500Qty)) : undefined;
    const d200 = denom200Qty !== '' ? parseInt(String(denom200Qty)) : undefined;
    const d100 = denom100Qty !== '' ? parseInt(String(denom100Qty)) : undefined;

    transactions.addTransaction({
      amount: Math.floor(parsedAmount), // Ensure whole number
      type,
      date,
      description,
      denom500: d500,
      denom200: d200,
      denom100: d100,
    });

    // Reset form
    amountInput = '';
    description = '';
    denom500Qty = '';
    denom200Qty = '';
    denom100Qty = '';
    formError = '';
    denominationError = '';
    // date = new Date().toISOString().split('T')[0]; // Optionally reset date
  }

  // Basic input formatting for Indian commas (simplified)
  // A more robust solution might involve a dedicated input masking library
  /**
   * Formats the amount input with Indian comma style as the user types.
   * @param {Event & { currentTarget: HTMLInputElement }} event - The input event.
   */
  function formatInputAmount(event) {
    const inputElement = event.currentTarget;
    let originalValue = inputElement.value;
    let cursorPos = inputElement.selectionStart || 0;
    
    const commasBeforeCursorOriginal = (originalValue.substring(0, cursorPos).match(/,/g) || []).length;
    let numericValue = originalValue.replace(/[^0-9]/g, '');

    if (numericValue === '') {
      amountInput = '';
      // When main amount is cleared, also clear denominations and trigger their validation
      autoCalculateDenominations(0); 
      return;
    }

    let formattedValue;
    if (numericValue.length <= 3) {
      formattedValue = numericValue;
    } else {
      const lastThree = numericValue.substring(numericValue.length - 3);
      const otherNumbers = numericValue.substring(0, numericValue.length - 3);
      formattedValue = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    }
    
    const previousAmountInput = amountInput;
    amountInput = formattedValue;

    // Only auto-calculate denominations if the formatted value actually changed
    // and the focus is not on a denomination field itself.
    if (formattedValue !== previousAmountInput) {
        const mainAmountNum = parseFloat(numericValue) || 0;
        if (typeof document !== 'undefined' && document.activeElement && !['denom500', 'denom200', 'denom100'].includes(document.activeElement.id)) {
            autoCalculateDenominations(mainAmountNum);
        } else if (typeof document === 'undefined' || !document.activeElement) {
            autoCalculateDenominations(mainAmountNum);
        }
    }


    Promise.resolve().then(() => {
      if (inputElement.value === formattedValue) {
        const commasInNewValueBeforeOldCursor = (formattedValue.substring(0, cursorPos).match(/,/g) || []).length;
        const newCursorPos = cursorPos + (commasInNewValueBeforeOldCursor - commasBeforeCursorOriginal);
        const finalCursorPos = Math.max(0, Math.min(newCursorPos, formattedValue.length));
        try {
            inputElement.setSelectionRange(finalCursorPos, finalCursorPos);
        } catch (e) {
            console.warn("Could not set cursor position:", e);
        }
      }
    });
  }
</script>

<form class="transaction-form" on:submit|preventDefault>
  {#if formError}
    <p class="error-message">{formError}</p>
  {/if}

  <div class="form-group">
    <label for="amount">Amount (INR) <span class="required-asterisk">*</span></label>
    <input
      type="text"
      id="amount"
      bind:value={amountInput}
      on:input={formatInputAmount}
      placeholder="e.g., 1,00,000"
      required
    />
  </div>

  <div class="form-group">
    <label for="date">Date <span class="required-asterisk">*</span></label>
    <input type="date" id="date" bind:value={date} />
  </div>

  <div class="form-group">
    <label for="description">Description</label>
    <input type="text" id="description" bind:value={description} placeholder="e.g., Groceries" />
  </div>

  <div class="denominations-section form-group">
    <h4>Denominations</h4>
    <div class="denom-grid">
      <div class="denom-item">
        <label for="denom500" class="denom-label">
          <span>₹500 Notes</span>
          {#if denom500Qty && denom500Qty !== '0'}
            <button type="button" on:click={() => resetSpecificDenomination(500)} class="btn-reset-specific-denom" title="Reset ₹500 quantity">↺</button>
          {/if}
        </label>
        <input type="number" id="denom500" bind:value={denom500Qty} on:input={() => handleDenomChange(500)} placeholder="0" min="0" />
      </div>
      <div class="denom-item">
        <label for="denom200" class="denom-label">
          <span>₹200 Notes</span>
          {#if denom200Qty && denom200Qty !== '0'}
            <button type="button" on:click={() => resetSpecificDenomination(200)} class="btn-reset-specific-denom" title="Reset ₹200 quantity">↺</button>
          {/if}
        </label>
        <input type="number" id="denom200" bind:value={denom200Qty} on:input={() => handleDenomChange(200)} placeholder="0" min="0" />
      </div>
      <div class="denom-item">
        <label for="denom100" class="denom-label">
          <span>₹100 Notes</span>
          {#if denom100Qty && denom100Qty !== '0'}
            <button type="button" on:click={() => resetSpecificDenomination(100)} class="btn-reset-specific-denom" title="Reset ₹100 quantity">↺</button>
          {/if}
        </label>
        <input type="number" id="denom100" bind:value={denom100Qty} on:input={() => handleDenomChange(100)} placeholder="0" min="0" />
      </div>
    </div>
    {#if denominationError}
      <p class="error-message denom-error">{denominationError}</p>
    {/if}
  </div>


  <div class="actions">
    <button type="button" class="btn btn-add" on:click={handleAdd}>Credit</button>
    <button type="button" class="btn btn-subtract" on:click={handleSubtract}>Debit</button>
  </div>
</form>

<style>
  .transaction-form {
    padding: 20px;
    background-color: #f9f9f9; /* Match global card style or theme */
    border-radius: 12px; /* Match global card style */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Softer shadow */
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500; /* Semibold for labels */
    color: #3c3c43; /* iOS secondary label color */
    font-size: 15px;
  }

  /* Input styles are now largely covered by app.css, but can add specifics */
  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group input[type="date"] {
    /* Ensure they pick up global styles or override if needed */
    font-size: 17px; /* Match global input size */
  }
  
  .denominations-section h4 {
    font-size: 16px; /* Keep size distinct if desired, or align with label size */
    font-weight: 500; /* Match label font-weight */
    color: #1c1c1e; /* Or match label color #3c3c43 */
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e5e5ea;
  }

  .denom-grid {
    display: flex;
    justify-content: space-between;
    gap: 8px; /* Reduced gap */
    align-items: end; 
  }

  .denom-item {
    flex: 1; /* Allow items to share space */
    min-width: 0; /* Allow items to shrink */
  }

  .denom-item label { /* Ensure label within denom-item behaves as expected */
    font-size: 13px; 
    color: #6c6c70; 
    /* display: block; Already set by global label style, but confirm if needed */
  }
  .denom-item input[type="number"] {
    margin-bottom: 0; /* Remove default bottom margin from global input style */
    text-align: center;
  }

  .denom-label {
    display: flex !important; /* Override general label 'display: block' */
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .btn-reset-specific-denom {
    background: none;
    border: none;
    color: #007aff; /* iOS blue */
    font-size: 0.9em; /* Smaller for individual resets */
    padding: 0 0 0 5px; /* Minimal padding, space from label text */
    margin: 0; /* Reset margin */
    cursor: pointer;
    line-height: 1; 
    box-shadow: none;
    font-weight: normal; /* Not bold like main buttons */
  }
  .btn-reset-specific-denom:hover {
    color: #005ecb;
    background: none;
    box-shadow: none;
  }
  .btn-reset-specific-denom:active {
    transform: none;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    gap: 12px; /* Increased gap for better separation */
    margin-top: 20px;
  }

  .btn { /* These styles will be overridden by app.css if more specific */
    flex-grow: 1; 
    padding: 14px 15px; /* Slightly larger padding */
    font-size: 17px; /* Match global button font size */
    font-weight: 600;
  }

  .btn-add {
    background-color: #34c759; /* iOS green */
    color: white;
  }
  .btn-add:hover {
    background-color: #2aa14a;
  }

  .btn-subtract {
    background-color: #ff3b30; /* iOS red */
    color: white;
  }
  .btn-subtract:hover {
    background-color: #d92c20;
  }

  .error-message {
    color: #ff3b30; /* iOS red for errors */
    margin-bottom: 12px;
    text-align: center;
    font-weight: 500;
    font-size: 14px;
    padding: 8px;
    background-color: rgba(255, 59, 48, 0.1);
    border-radius: 8px;
  }
  .denom-error {
    margin-top: 10px; /* Specific margin for denomination error */
  }
  .required-asterisk {
    color: #ff3b30; /* iOS red */
    margin-left: 2px;
  }
</style>
