/**
 * Formats a date string or Date object into "DD MMM YYYY" format.
 * e.g., "2023-10-26" becomes "26 Oct 2023".
 * @param {string | Date} dateInput The date to format.
 * @returns {string} The formatted date string.
 */
export function formatDisplayDate(dateInput) {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error("Error formatting date:", dateInput, error);
    return String(dateInput); // Fallback to original if formatting fails
  }
}
