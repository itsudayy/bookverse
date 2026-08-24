// Every Store price is Bangladeshi Taka, formatted in one place so the symbol
// and grouping never drift between the grid, the cart and the order summary.
export const taka = (amount) =>
  `৳${Number(amount || 0).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
