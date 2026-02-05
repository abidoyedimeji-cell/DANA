"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Clock,
  CheckCircle,
  X,
  Gift,
} from "lucide-react"
import Link from "next/link"
import { topUpWallet } from "@/app/actions/stripe"
import { applyPromoCode } from "@/app/actions/bookings"
import { toast } from "sonner"

interface WalletData {
  balance: number
  currency: string
}

interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "payment" | "refund"
  amount: number
  description: string
  created_at: string
  status: string
}

const DEPOSIT_AMOUNTS = [10, 25, 50, 100, 200]

export default function WalletPage() {
  const { user, isGuest } = useAuth()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWalletData()
    } else {
      // Set placeholder data
      setWallet({ balance: 75.5, currency: "GBP" })
      setTransactions([
        {
          id: "1",
          type: "deposit",
          amount: 50,
          description: "Added funds",
          created_at: new Date().toISOString(),
          status: "completed",
        },
        {
          id: "2",
          type: "payment",
          amount: -25,
          description: "Date at The Ivy Chelsea",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: "completed",
        },
        {
          id: "3",
          type: "deposit",
          amount: 100,
          description: "Added funds",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          status: "completed",
        },
        {
          id: "4",
          type: "payment",
          amount: -49.5,
          description: "Date at Sketch London",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          status: "completed",
        },
      ])
      setLoading(false)
    }
  }, [user])

  const fetchWalletData = async () => {
    try {
      const supabase = createClient()

      // Check if wallet exists, create if not
      let { data: walletData } = await supabase.from("wallets").select("*").eq("user_id", user?.id).single()

      if (!walletData) {
        // Create wallet
        const { data: newWallet } = await supabase
          .from("wallets")
          .insert({ user_id: user?.id, balance: 0, currency: "GBP" })
          .select()
          .single()
        walletData = newWallet
      }

      setWallet(
        walletData ? { balance: walletData.balance, currency: walletData.currency } : { balance: 0, currency: "GBP" },
      )

      // Fetch transactions
      const { data: txData } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20)

      setTransactions(txData || [])
    } catch (error) {
      console.error("Error fetching wallet:", error)
      setWallet({ balance: 0, currency: "GBP" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddFunds = async () => {
    const amount = selectedAmount || Number.parseFloat(customAmount)
    if (!amount || amount <= 0) return

    setIsProcessing(true)
    const result = await topUpWallet(amount)
    setIsProcessing(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if (result.url) {
      window.location.href = result.url
    }
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return

    setIsApplyingPromo(true)
    const result = await applyPromoCode(promoCode)
    setIsApplyingPromo(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`£${result.amount} added to your wallet!`)
      setPromoCode("")
      fetchWalletData()
    }
  }

  if (isGuest) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <Wallet className="w-16 h-16 text-[#E91E8C] mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Sign in to access your wallet</h2>
        <p className="text-white/60 text-center mb-6">Add funds for easy date payments</p>
        <Link href="/auth">
          <Button className="bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white rounded-full px-8 py-6">Sign In</Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E91E8C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/app/profile">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-white font-bold text-xl">Wallet</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm">Available Balance</span>
            </div>
            <p className="text-5xl font-bold text-white mb-6">£{wallet?.balance.toFixed(2)}</p>
            <Button
              onClick={() => setShowAddFunds(true)}
              className="bg-white text-[#E91E8C] hover:bg-white/90 rounded-full px-6 py-3 font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Funds
            </Button>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Have a Promo Code?</h3>
          </div>
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button
              onClick={handleApplyPromo}
              disabled={isApplyingPromo || !promoCode.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isApplyingPromo ? "..." : "Apply"}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#2DD4BF]/20 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-[#2DD4BF]" />
            </div>
            <span className="text-white text-sm font-medium">Send</span>
          </button>
          <button className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#FFD166]/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#FFD166]" />
            </div>
            <span className="text-white text-sm font-medium">Pay for Date</span>
          </button>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "deposit" || tx.type === "refund" ? "bg-[#2DD4BF]/20" : "bg-[#E91E8C]/20"
                    }`}
                  >
                    {tx.type === "deposit" || tx.type === "refund" ? (
                      <ArrowDownLeft
                        className={`w-5 h-5 ${tx.type === "deposit" ? "text-[#2DD4BF]" : "text-[#FFD166]"}`}
                      />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-[#E91E8C]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{tx.description}</p>
                    <p className="text-white/60 text-xs">
                      {new Date(tx.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${
                      tx.type === "deposit" || tx.type === "refund" ? "text-[#2DD4BF]" : "text-white"
                    }`}
                  >
                    {tx.type === "deposit" || tx.type === "refund" ? "+" : ""}£{Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-zinc-900 w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-bold">Add Funds</h3>
              <button onClick={() => setShowAddFunds(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Amount Options */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {DEPOSIT_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount("")
                  }}
                  className={`py-4 rounded-xl font-semibold transition-all ${
                    selectedAmount === amount ? "bg-[#E91E8C] text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  £{amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="text-white/60 text-sm mb-2 block">Or enter custom amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">£</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg focus:border-[#E91E8C] focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 mb-6">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">•••• •••• •••• 4242</p>
                <p className="text-white/60 text-xs">Expires 12/26</p>
              </div>
              <CheckCircle className="w-5 h-5 text-[#2DD4BF]" />
            </div>

            <Button
              onClick={handleAddFunds}
              disabled={isProcessing || (!selectedAmount && !customAmount)}
              className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white rounded-full py-6 font-semibold text-lg"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                `Add £${selectedAmount || customAmount || "0"}`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
