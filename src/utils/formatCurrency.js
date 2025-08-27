// Utility for formatting currency
export function formatCurrency(amount) {
  const number = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
}