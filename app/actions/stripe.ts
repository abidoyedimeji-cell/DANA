"use server"

import { stripe, SUBSCRIPTION_PLANS } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function createCheckoutSession(planType: "monthly" | "yearly") {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    const priceId =
      planType === "monthly" ? SUBSCRIPTION_PLANS.PREMIUM.monthlyPriceId : SUBSCRIPTION_PLANS.PREMIUM.yearlyPriceId

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pricing`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
    })

    return { url: session.url }
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return { error: "Failed to create checkout session" }
  }
}

export async function createPortalSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single()

    if (!profile?.stripe_customer_id) {
      return { error: "No subscription found" }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/settings`,
    })

    return { url: session.url }
  } catch (error) {
    console.error("Stripe portal error:", error)
    return { error: "Failed to create portal session" }
  }
}

export async function topUpWallet(amount: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  if (amount < 5 || amount > 500) {
    return { error: "Amount must be between £5 and £500" }
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Wallet Top-Up",
              description: `Add £${amount} to your DANA wallet`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/wallet?top_up=success&amount=${amount}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/wallet`,
      metadata: {
        user_id: user.id,
        type: "wallet_topup",
        amount: amount.toString(),
      },
    })

    return { url: session.url }
  } catch (error) {
    console.error("Wallet top-up error:", error)
    return { error: "Failed to create top-up session" }
  }
}
