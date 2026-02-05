import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    )
  }
  const body = await req.text()
  const signature = (await headers()).get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.metadata?.type === "wallet_topup") {
          // Handle wallet top-up
          const userId = session.metadata.user_id
          const amount = Number.parseFloat(session.metadata.amount)

          let { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle()

          if (!wallet) {
            const { data: newWallet } = await supabase.from("wallets").insert({ user_id: userId, balance: 0, currency: "GBP" }).select().single()
            wallet = newWallet
          }
          if (wallet) {
            await supabase
              .from("wallets")
              .update({ balance: (wallet.balance ?? 0) + amount })
              .eq("user_id", userId)

            await supabase.from("wallet_transactions").insert({
              user_id: userId,
              type: "deposit",
              amount: amount,
              description: "Wallet top-up via Stripe",
              status: "completed",
            })
          }
        } else if (session.metadata?.plan_type) {
          // Handle subscription creation
          const userId = session.metadata.user_id
          const planType = session.metadata.plan_type

          // Get subscription from Stripe
          const subscriptionId = session.subscription as string
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          // Create subscription record
          const { data: plans } = await supabase.from("subscription_plans").select("*").limit(1).single()

          await supabase.from("subscriptions").insert({
            user_id: userId,
            plan_id: plans?.id,
            plan_type: planType,
            status: "active",
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
          })

          // Update profile
          await supabase
            .from("profiles")
            .update({
              subscription_tier: planType,
              stripe_customer_id: session.customer as string,
            })
            .eq("id", userId)

          // Add complimentary credits (£10 monthly)
          let { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle()
          if (!wallet) {
            const { data: newWallet } = await supabase.from("wallets").insert({ user_id: userId, balance: 0, currency: "GBP" }).select().single()
            wallet = newWallet
          }
          if (wallet) {
            await supabase
              .from("wallets")
              .update({ balance: (wallet.balance ?? 0) + 10 })
              .eq("user_id", userId)

            await supabase.from("wallet_transactions").insert({
              user_id: userId,
              type: "deposit",
              amount: 10.0,
              description: "Premium subscription - complimentary credits",
              status: "completed",
            })
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.user_id

        await supabase
          .from("subscriptions")
          .update({ status: subscription.status })
          .eq("stripe_subscription_id", subscription.id)

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from("subscriptions")
          .update({ status: "cancelled", end_date: new Date().toISOString() })
          .eq("stripe_subscription_id", subscription.id)

        // Update profile tier back to free
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (sub) {
          await supabase.from("profiles").update({ subscription_tier: "free" }).eq("id", sub.user_id)
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
