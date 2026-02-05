import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
})

export const SUBSCRIPTION_PLANS = {
  PREMIUM: {
    productId: "prod_TjP99aq18C0dNk",
    monthlyPriceId: "price_1SlwNwGhwdDCtw19Rmjz127u",
    yearlyPriceId: "price_1SlwOwGhwdDCtw193ymQSOnV",
    monthlyPrice: 9.99,
    yearlyPrice: 120.0,
  },
}
