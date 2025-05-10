import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

const localStorageKey = 'mobile-ledger-transactions';

/**
 * @typedef {Object} Transaction
 * @property {string} id - Unique identifier for the transaction.
 * @property {number} amount - The transaction amount.
 * @property {'add' | 'subtract'} type - Type of transaction.
 * @property {string} date - Date of the transaction (YYYY-MM-DD).
 * @property {string} description - Optional description for the transaction.
 */

/**
 * Creates a Svelte store for managing transactions with localStorage persistence.
 */
function createTransactionStore() {
  let initialTransactions = [];
  if (browser) {
    // Initialize with data from localStorage or an empty array, only in browser.
    initialTransactions = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  }
  const { subscribe, set, update } = writable(initialTransactions);

  // Subscribe to changes and update localStorage, only in browser.
  if (browser) {
    subscribe(currentTransactions => {
      localStorage.setItem(localStorageKey, JSON.stringify(currentTransactions));
    });
  }

  return {
    subscribe,
    /**
     * Adds a new transaction.
     * @param {{ amount: number, type: 'add' | 'subtract', date: string, description?: string }} transactionDetails
     */
    addTransaction: (transactionDetails) => {
      update(transactions => {
        const newTransaction = {
          id: crypto.randomUUID(), // Generate a unique ID
          amount: transactionDetails.amount,
          type: transactionDetails.type,
          date: transactionDetails.date || new Date().toISOString().split('T')[0], // Default to today
          description: transactionDetails.description || '',
        };
        // Add to the beginning of the array so latest is first
        return [newTransaction, ...transactions];
      });
    },
    /**
     * Deletes a transaction by its ID.
     * @param {string} id - The ID of the transaction to delete.
     */
    deleteTransaction: (id) => {
      update(transactions => transactions.filter(/** @param {Transaction} tx */ tx => tx.id !== id));
    },
    /**
     * Edits an existing transaction.
     * @param {string} id - The ID of the transaction to edit.
     * @param {Partial<Omit<Transaction, 'id'>>} updatedDetails - The details to update.
     */
    editTransaction: (id, updatedDetails) => {
      update(transactions =>
        transactions.map(/** @param {Transaction} tx */ tx =>
          tx.id === id ? { ...tx, ...updatedDetails } : tx
        )
      );
    },
    /**
     * Sets the entire transactions array.
     * @param {Transaction[]} transactions - The new array of transactions.
     */
    set: (transactions) => set(transactions) // Allow overwriting the store, e.g., for initialization or reset
  };
}

export const transactions = createTransactionStore();

/**
 * Derived store to calculate the current balance.
 */
export const currentBalance = derived(
  transactions,
  ($transactions, set) => {
    let balance = 0;
    // Iterate in reverse to calculate running balance correctly if needed,
    // but for total balance, order doesn't strictly matter.
    // For consistency with potential running balance display later, let's sum it up.
    for (let i = $transactions.length - 1; i >= 0; i--) {
      const tx = $transactions[i];
      if (tx.type === 'add') {
        balance += tx.amount;
      } else if (tx.type === 'subtract') {
        balance -= tx.amount;
      }
    }
    set(balance);
  },
  0 // Initial value for the derived store
);
