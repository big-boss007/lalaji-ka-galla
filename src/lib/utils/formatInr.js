/**
 * Formats a number into the Indian numbering system string.
 * e.g., 100000 becomes "1,00,000"
 * Handles whole numbers only, as per project requirements.
 *
 * @param {number | string | null | undefined} amount The number to format.
 * @returns {string} The formatted INR string (e.g., "1,00,000"),
 *                   or "0" if the input is invalid, null, undefined, or zero.
 */
export function formatInr(amount) {
  // Convert to string first to handle potential string inputs, then parse.
  const num = parseFloat(String(amount));

  // Check if the conversion resulted in NaN (e.g., for non-numeric strings)
  // or if the original amount was null/undefined.
  if (amount === null || amount === undefined || isNaN(num)) {
    return '0';
  }

  // Ensure we are dealing with a whole number by taking the floor.
  const wholeAmount = Math.floor(num);

  // Use toLocaleString with 'en-IN' locale for Indian numbering system.
  // Set fraction digits to 0 to ensure whole numbers are displayed.
  return wholeAmount.toLocaleString('en-IN', {
    style: 'decimal', // Use 'decimal' as we only need the number format, not currency symbols here.
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
