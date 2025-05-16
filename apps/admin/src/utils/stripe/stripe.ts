// /utils/stripe/stripe.ts
import "server-only";
import Stripe from "stripe";

let _stripe: Stripe | undefined;

function getSecretKey(): string {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("Stripe secret key is not defined");
  return k;
}
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getSecretKey());
  }
  return _stripe;
}
