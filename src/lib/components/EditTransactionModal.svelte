<script>
  import { createEventDispatcher } from 'svelte';
  import { transactions } from '$lib/stores/transactions.js';
  import { formatInr } from '$lib/utils/formatInr.js';

  /**
   * @typedef {import('$lib/stores/transactions.js').Transaction} Transaction
   */

  /** @type {Transaction | null} */
  export let transactionToEdit = null;

  // Form state
  let amountInput = '';
  let date = '';
  let description = '';
  let type = 'add';
  
  // Denomination state
  let denom500Qty = '';
  let denom200Qty = '';
  let denom100Qty = '';
  
  let formError = '';
  let denominationError = '';

  const dispatch = createEventDispatcher();

  // Initialize form when transactionToEdit changes
  $: if (transactionToEdit) {
    date = transactionToEdit.date;
    description = transactionToEdit.description || '';
    type = transactionToEdit.type;
    
    denom500Qty = transactionToEdit.denom500 ? String(transactionToEdit.denom500) : '';
    denom200Qty = transactionToEdit.denom200 ? String(transactionToEdit.denom200) : '';
    denom100Qty = transactionToEdit.denom100 ? String(transactionToEdit.denom100) : '';
    
    formError = '';
    denominationError = '';

    const initialNumericAmount = parseFloat(String(transactionToEdit.amount)) || 0;
    if (initialNumericAmount > 0) {
      const numericStr = String(initialNumericAmount);
      if (numericStr.length <= 3) {
        amountInput = numericStr;
      } else {
        const lastThree = numericStr.substring(numericStr.length - 3);
        const otherNumbers = numericStr.substring(0, numericStr.length - 3);
        amountInput = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
      }
    } else {
      amountInput = '';
    }
    autoCalculateDenominations(initialNumericAmount);

  } else { 
    amountInput = '';
    date = '';
    description = '';
    type = 'add';
    denom500Qty = '';
    denom200Qty = '';
    denom100Qty = '';
    formError = '';
    denominationError = '';
  }

  /** @param {Event & { currentTarget: HTMLInputElement }} event */
  function formatInputAmount(event) {
    const inputElement = event.currentTarget;
    let originalValue = inputElement.value;
    let cursorPos = inputElement.selectionStart || 0;
    
    const commasBeforeCursorOriginal = (originalValue.substring(0, cursorPos).match(/,/g) || []).length;
    let numericValue = originalValue.replace(/[^0-9]/g, '');

    if (numericValue === '') {
      amountInput = '';
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

    if (formattedValue !== previousAmountInput) {
        const mainAmountNum = parseFloat(numericValue) || 0;
        if (typeof document !== 'undefined' && document.activeElement && !['edit-denom500', 'edit-denom200', 'edit-denom100'].includes(document.activeElement.id)) {
            autoCalculateDenominations(mainAmountNum);
        } else if (typeof document === 'undefined' || !document.activeElement) {
            autoCalculateDenominations(mainAmountNum);
        }
    }

    Promise.resolve().then(() => {
      if (inputElement && inputElement.value === formattedValue) {
        const newCursorPos = cursorPos + (formattedValue.length - originalValue.length);
        const finalCursorPos = Math.max(0, Math.min(newCursorPos, formattedValue.length));
        try {
            inputElement.setSelectionRange(finalCursorPos, finalCursorPos);
        } catch (e) { /* console.warn("Could not set cursor position:", e); */ }
      }
    });
  }

  /** 
   * @param {number} totalAmount 
   * @param {500 | 200 | 100 | null} [fixedDenom=null]
   * @param {number} [fixedQty=0] 
   */
  function autoCalculateDenominations(totalAmount, fixedDenom = null, fixedQty = 0) {
    if (isNaN(totalAmount) || totalAmount < 0) {
      denom500Qty = ''; denom200Qty = ''; denom100Qty = '';
      validateDenominations(); return;
    }
    if (totalAmount === 0) {
      denom500Qty = ''; denom200Qty = ''; denom100Qty = '';
      validateDenominations(); return;
    }

    let remainingAmount = totalAmount;
    let d500 = 0, d200 = 0, d100 = 0;

    if (fixedDenom === 500) {
      d500 = fixedQty; remainingAmount -= d500 * 500;
      if(remainingAmount < 0) remainingAmount = 0;
      d200 = Math.floor(remainingAmount / 200); remainingAmount %= 200;
      d100 = Math.floor(remainingAmount / 100);
    } else if (fixedDenom === 200) {
      d500 = parseInt(String(denom500Qty)) || 0; remainingAmount -= d500 * 500;
      if(remainingAmount < 0) remainingAmount = 0;
      d200 = fixedQty; remainingAmount -= d200 * 200;
      if(remainingAmount < 0) remainingAmount = 0;
      d100 = Math.floor(remainingAmount / 100);
    } else if (fixedDenom === 100) {
      d500 = parseInt(String(denom500Qty)) || 0; 
      d200 = parseInt(String(denom200Qty)) || 0; 
      remainingAmount -= (d500 * 500) + (d200 * 200);
      if(remainingAmount < 0) remainingAmount = 0;
      d100 = fixedQty;
    } else {
      d500 = Math.floor(remainingAmount / 500); remainingAmount %= 500;
      d200 = Math.floor(remainingAmount / 200); remainingAmount %= 200;
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
      denominationError = ''; return;
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
  
  /** @param {500 | 200 | 100} denomType */
  function handleDenomChange(denomType) {
    const mainAmountNum = parseFloat(amountInput.replace(/,/g, '')) || 0;
    if (denomType === 500) autoCalculateDenominations(mainAmountNum, 500, parseInt(String(denom500Qty)) || 0);
    else if (denomType === 200) autoCalculateDenominations(mainAmountNum, 200, parseInt(String(denom200Qty)) || 0);
    else if (denomType === 100) validateDenominations();
  }

  /** @param {500 | 200 | 100} denomToReset */
  function resetSpecificDenomination(denomToReset) {
    const mainAmountNum = parseFloat(amountInput.replace(/,/g, '')) || 0;
    if (denomToReset === 500) { denom500Qty = ''; autoCalculateDenominations(mainAmountNum, 500, 0); }
    else if (denomToReset === 200) { denom200Qty = ''; autoCalculateDenominations(mainAmountNum, 200, 0); }
    else if (denomToReset === 100) { denom100Qty = ''; validateDenominations(); }
  }

  function handleSubmit() {
    formError = '';
    validateDenominations();

    if (denominationError) {
      formError = denominationError;
      return;
    }
    if (!transactionToEdit) return;

    const parsedAmount = parseFloat(amountInput.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      formError = 'Please enter a valid positive amount.';
      return;
    }
    
    const d500 = denom500Qty !== '' ? parseInt(denom500Qty) : undefined;
    const d200 = denom200Qty !== '' ? parseInt(denom200Qty) : undefined;
    const d100 = denom100Qty !== '' ? parseInt(denom100Qty) : undefined;

    transactions.editTransaction(transactionToEdit.id, {
      amount: Math.floor(parsedAmount),
      date,
      description,
      type: /** @type {'add' | 'subtract'} */ (type),
      denom500: d500,
      denom200: d200,
      denom100: d100,
    });
    closeModal();
  }

  function closeModal() {
    dispatch('close');
  }
</script>

{#if transactionToEdit}
<div
  class="modal-backdrop"
  on:click|self={closeModal}
  on:keydown={(e) => e.key === 'Escape' && closeModal()}
  role="button"
  tabindex="-1" 
  aria-label="Close modal"
>
  <div 
    class="modal-content" 
    role="dialog" 
    aria-labelledby="edit-modal-title" 
    on:click|stopPropagation 
    on:keydown={(e) => e.key === 'Escape' && closeModal()}
    tabindex="0" 
  >
    <h3 id="edit-modal-title">Edit Transaction</h3>
    {#if formError || denominationError}
      <p class="error-message">{formError || denominationError}</p>
    {/if}
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-row">
        <div class="form-group amount-group">
          <label for="edit-amount">Amount (INR) <span class="required-asterisk">*</span></label>
          <input type="text" id="edit-amount" bind:value={amountInput} on:input={formatInputAmount} required />
        </div>
        <div class="form-group type-group">
          <label for="edit-type">Type</label>
          <select id="edit-type" bind:value={type}>
            <option value="add">Credit</option>
            <option value="subtract">Debit</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="edit-date">Date <span class="required-asterisk">*</span></label>
        <input type="date" id="edit-date" bind:value={date} required />
      </div>
      <div class="form-group">
        <label for="edit-description">Description</label>
        <input type="text" id="edit-description" bind:value={description} />
      </div>

      <div class="denominations-section form-group">
        <h4>Denominations</h4>
        {#if denominationError && !formError}
          <p class="error-message denom-error">{denominationError}</p>
        {/if}
        <div class="denom-grid">
          <div class="denom-item">
            <label for="edit-denom500" class="denom-label">
              <span>₹500 Notes</span>
              {#if denom500Qty && denom500Qty !== '0'}
                <button type="button" on:click={() => resetSpecificDenomination(500)} class="btn-reset-specific-denom" title="Reset ₹500 quantity">↺</button>
              {/if}
            </label>
            <input type="number" id="edit-denom500" bind:value={denom500Qty} on:input={() => handleDenomChange(500)} placeholder="0" min="0" />
          </div>
          <div class="denom-item">
            <label for="edit-denom200" class="denom-label">
              <span>₹200 Notes</span>
              {#if denom200Qty && denom200Qty !== '0'}
                <button type="button" on:click={() => resetSpecificDenomination(200)} class="btn-reset-specific-denom" title="Reset ₹200 quantity">↺</button>
              {/if}
            </label>
            <input type="number" id="edit-denom200" bind:value={denom200Qty} on:input={() => handleDenomChange(200)} placeholder="0" min="0" />
          </div>
          <div class="denom-item">
            <label for="edit-denom100" class="denom-label">
              <span>₹100 Notes</span>
              {#if denom100Qty && denom100Qty !== '0'}
                <button type="button" on:click={() => resetSpecificDenomination(100)} class="btn-reset-specific-denom" title="Reset ₹100 quantity">↺</button>
              {/if}
            </label>
            <input type="number" id="edit-denom100" bind:value={denom100Qty} on:input={() => handleDenomChange(100)} placeholder="0" min="0" />
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button type="submit" class="btn-save">Save Changes</button>
        <button type="button" class="btn-cancel" on:click={closeModal}>Cancel</button>
      </div>
    </form>
  </div>
</div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001; 
  }
  .modal-content {
    background-color: white;
    padding: 25px 20px; /* Reduced horizontal padding */
    border-radius: 12px; 
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    width: 90%;
    max-width: 480px; 
  }
  .modal-content h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #1c1c1e; 
    font-size: 1.6rem; 
    text-align: center;
  }

  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px; 
  }
  .amount-group {
    flex: 2; 
    margin-bottom: 0 !important; 
  }
  .type-group {
    flex: 1; 
    margin-bottom: 0 !important; 
  }

  .form-group {
    margin-bottom: 16px;
  }
  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500; 
    color: #3c3c43; 
    font-size: 15px;
  }
  /* Inputs and select inherit from app.css */

  .modal-actions {
    margin-top: 25px;
    display: flex;
    justify-content: space-between; /* Changed from flex-end */
    gap: 12px;
  }
  .modal-actions button {
    padding: 10px 20px; 
    flex-grow: 1; /* Added to make buttons fluid */
  }
  .btn-save {
    background-color: #34c759; 
  }
  .btn-save:hover {
    background-color: #2aa14a;
  }
  .btn-cancel {
    background-color: #8e8e93; 
  }
  .btn-cancel:hover {
    background-color: #787880;
  }
  .error-message {
    color: #ff3b30; 
    margin-bottom: 15px;
    font-size: 0.9rem;
    text-align: center;
    padding: 8px;
    background-color: rgba(255, 59, 48, 0.1);
    border-radius: 8px;
  }

  .required-asterisk {
    color: #ff3b30;
    margin-left: 2px;
  }
  .denominations-section h4 {
    font-size: 1rem; 
    font-weight: 500; 
    color: #3c3c43; 
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e5e5ea; 
  }
  .denom-grid {
    display: flex;
    justify-content: space-between;
    gap: 8px; 
    align-items: end; 
  }
  .denom-item {
    flex: 1; 
    min-width: 0; 
  }
  .denom-item label { 
    font-size: 0.85rem; 
    color: #6c6c70; 
    display: block; 
    margin-bottom: 4px;
    /* font-size: 0.85rem; /* This rule might be overriding .denom-label if it's more specific or later in cascade */
    /* color: #6c6c70; */ 
  }
  .denom-item .denom-label { /* Increased specificity */
    display: flex !important; 
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 0.75rem; /* Reduced from 0.85rem */
    color: #6c6c70; 
  }
  .denom-item input[type="number"] {
    text-align: center;
    padding: 8px; 
  }
  .btn-reset-specific-denom {
    background: none;
    border: none;
    color: #007aff; 
    font-size: 0.9em; 
    padding: 0 0 0 5px; 
    margin: 0; 
    cursor: pointer;
    line-height: 1; 
    box-shadow: none;
    font-weight: normal; 
  }
  .btn-reset-specific-denom:hover {
    color: #005ecb;
    background: none;
    box-shadow: none;
  }
  .btn-reset-specific-denom:active {
    transform: none;
  }
  .denom-error { 
    color: #ff3b30;
    font-size: 0.85rem;
    margin-top: 8px; 
    text-align: center; 
  }
</style>
