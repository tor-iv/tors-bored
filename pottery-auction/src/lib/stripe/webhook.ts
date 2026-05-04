import type Stripe from 'stripe';
import { stripe } from './server';

export function verifyStripeEvent(
  payload: Buffer | string,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
