import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY
export const stripe: Stripe | null = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    })
  : null

export const SUBSCRIPTION_PLANS = {
  PREMIUM: {
    productId: "prod_TjP99aq18C0dNk",
    monthlyPriceId: "price_1SlwNwGhwdDCtw19Rmjz127u",
    yearlyPriceId: "price_1SlwOwGhwdDCtw193ymQSOnV",
    monthlyPrice: 9.99,
    yearlyPrice: 120.0,
  },
}
