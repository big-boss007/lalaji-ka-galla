<script>
  import { createEventDispatcher } from 'svelte';
  import { transactions } from '$lib/stores/transactions.js';

  /**
   * @typedef {import('$lib/stores/transactions.js').Transaction} Transaction
   */

  /** @type {Transaction | null} */
  export let transactionToEdit = null; // Passed in when opening the modal

  let amount = 0;
  let date = '';
  let description = '';
  let type = 'add'; // Default, will be overridden
  let formError = '';

  const dispatch = createEventDispatcher();

  // When transactionToEdit changes (modal is opened with a transaction), populate form
  $: if (transactionToEdit) {
    amount = transactionToEdit.amount;
    date = transactionToEdit.date;
    description = transactionToEdit.description;
    type = transactionToEdit.type;
    formError = ''; // Reset error on open
  }

  function handleSubmit() {
    formError = '';
    if (!transactionToEdit) return;

    const parsedAmount = parseFloat(String(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      formError = 'Please enter a valid positive amount.';
      return;
    }

    transactions.editTransaction(transactionToEdit.id, {
      amount: Math.floor(parsedAmount),
      date,
      description,
      type: /** @type {'add' | 'subtract'} */ (type), // Cast to expected type
    });
    closeModal();
  }

  function closeModal() {
    dispatch('close');
    // Reset fields for next time, though transactionToEdit changing will also do this
    transactionToEdit = null;
    amount = 0;
    date = '';
    description = '';
    formError = '';
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
    {#if formError}
      <p class="error-message">{formError}</p>
    {/if}
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="edit-amount">Amount (INR)</label>
        <input type="number" id="edit-amount" bind:value={amount} required min="1" step="1"/>
      </div>
      <div class="form-group">
        <label for="edit-date">Date</label>
        <input type="date" id="edit-date" bind:value={date} required />
      </div>
      <div class="form-group">
        <label for="edit-description">Description</label>
        <input type="text" id="edit-description" bind:value={description} />
      </div>
      <div class="form-group">
        <label for="edit-type">Type</label>
        <select id="edit-type" bind:value={type}>
          <option value="add">Add Money</option>
          <option value="subtract">Subtract Money</option>
        </select>
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
    z-index: 1001; /* Higher than navbar */
  }
  .modal-content {
    background-color: white;
    padding: 25px 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    width: 90%;
    max-width: 450px;
  }
  .modal-content h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-size: 1.5rem;
  }
  .form-group {
    margin-bottom: 15px;
  }
  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #444;
  }
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1rem;
  }
  .modal-actions {
    margin-top: 25px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  .modal-actions button {
    padding: 10px 18px;
    border: none;
    border-radius: 4px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
  }
  .btn-save {
    background-color: #28a745;
    color: white;
  }
  .btn-save:hover {
    background-color: #218838;
  }
  .btn-cancel {
    background-color: #6c757d;
    color: white;
  }
  .btn-cancel:hover {
    background-color: #5a6268;
  }
  .error-message {
    color: #dc3545;
    margin-bottom: 10px;
    font-size: 0.9rem;
  }
</style>
