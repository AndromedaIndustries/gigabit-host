import "server-only";

import Stripe from "stripe";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const secret_key = process.env.STRIPE_SECRET_KEY;

if (!secret_key) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(secret_key);
