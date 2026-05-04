// Flat shipping + NY sales tax. These are intentionally hardcoded for MVP.
// Stripe Tax / live shipping calc are v2.
const SHIPPING_CENTS = 1200;
const TAX_RATE = 0.08875; // NY 8.875%

export interface OrderTotals {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}

export function computeTotals(buyNowPriceDollars: number): OrderTotals {
  const subtotalCents = Math.round(buyNowPriceDollars * 100);
  const shippingCents = SHIPPING_CENTS;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + shippingCents + taxCents;
  return { subtotalCents, shippingCents, taxCents, totalCents };
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}
