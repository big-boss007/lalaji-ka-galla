<script>
  import { transactions } from '$lib/stores/transactions.js';

  let amountInput = ''; // Store raw input for amount
  let date = new Date().toISOString().split('T')[0]; // Default to today
  let description = '';
  let formError = '';

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
    const parsedAmount = parseFloat(amountInput.replace(/,/g, '')); // Remove commas before parsing

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      formError = 'Please enter a valid positive amount.';
      return;
    }

    transactions.addTransaction({
      amount: Math.floor(parsedAmount), // Ensure whole number
      type,
      date,
      description,
    });

    // Reset form
    amountInput = '';
    // date = new Date().toISOString().split('T')[0]; // Optionally reset date
    description = '';
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
    
    // Count commas before cursor in original value
    const commasBeforeCursorOriginal = (originalValue.substring(0, cursorPos).match(/,/g) || []).length;

    // Remove non-digits
    let numericValue = originalValue.replace(/[^0-9]/g, '');

    if (numericValue === '') {
      amountInput = '';
      return;
    }

    // Apply Indian comma formatting
    let formattedValue;
    if (numericValue.length <= 3) {
      formattedValue = numericValue;
    } else {
      const lastThree = numericValue.substring(numericValue.length - 3);
      const otherNumbers = numericValue.substring(0, numericValue.length - 3);
      formattedValue = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    }
    
    amountInput = formattedValue;

    // After Svelte updates the input, try to restore cursor position
    // This needs to run after the DOM update
    Promise.resolve().then(() => {
      if (inputElement.value === formattedValue) { // Check if update has occurred
        const commasBeforeCursorNew = (formattedValue.substring(0, cursorPos + (formattedValue.length - originalValue.length) + (commasBeforeCursorOriginal - (formattedValue.substring(0, cursorPos).match(/,/g) || []).length) ).match(/,/g) || []).length;
        const newCursorPos = cursorPos + (commasBeforeCursorNew - commasBeforeCursorOriginal);
        
        // Ensure cursor position is within bounds
        const finalCursorPos = Math.max(0, Math.min(newCursorPos, formattedValue.length));

        try {
            inputElement.setSelectionRange(finalCursorPos, finalCursorPos);
        } catch (e) {
            // In case the element is not focusable or other issues
            console.warn("Could not set cursor position:", e);
        }
      }
    });
  }
</script>

<form class="transaction-form">
  {#if formError}
    <p class="error-message">{formError}</p>
  {/if}

  <div class="form-group">
    <label for="amount">Amount (INR)</label>
    <!-- Use text type to allow comma input; parsing happens on submit -->
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
    <label for="date">Date</label>
    <input type="date" id="date" bind:value={date} />
  </div>

  <div class="form-group">
    <label for="description">Description (Optional)</label>
    <input type="text" id="description" bind:value={description} placeholder="e.g., Groceries" />
  </div>

  <div class="actions">
    <button type="button" class="btn btn-add" on:click={handleAdd}>Credit</button>
    <button type="button" class="btn btn-subtract" on:click={handleSubtract}>Debit</button>
  </div>
</form>

<style>
  .transaction-form {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
  }

  .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    gap: 10px; /* Adds space between buttons */
  }

  .btn {
    flex-grow: 1; /* Make buttons share space equally */
    padding: 12px 15px;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-add {
    background-color: #28a745; /* Green */
    color: white;
  }
  .btn-add:hover {
    background-color: #218838;
  }

  .btn-subtract {
    background-color: #dc3545; /* Red */
    color: white;
  }
  .btn-subtract:hover {
    background-color: #c82333;
  }

  .error-message {
    color: #dc3545; /* Red */
    margin-bottom: 10px;
    text-align: center;
    font-weight: 500;
  }
</style>
