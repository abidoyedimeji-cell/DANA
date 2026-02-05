"use client"

import { useState, useEffect } from "react"
import { Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function DealsTab() {
  const [deals, setDeals] = useState<any[]>([])
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("deals")
      .select("*, venues(name, image_url)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setDeals(data)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-white/60">Loading deals...</p>
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-white/60">No active deals at the moment. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {deals.map((deal) => {
        const isExpanded = expandedDeal === deal.id

        return (
          <div
            key={deal.id}
            className="bg-gradient-to-br from-[#FF6B35]/20 to-[#E91E8C]/20 rounded-2xl overflow-hidden border border-[#FF6B35]/30"
          >
            {/* Deal Card Header */}
            <div className="relative aspect-[21/9]">
              <img
                src={deal.venues?.image_url || "/placeholder.svg"}
                alt={deal.venues?.name || "Venue"}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-[#FBBF24]" />
                  <span className="text-[#FBBF24] text-xs font-bold uppercase">{deal.type}</span>
                </div>
                <h3 className="text-white font-bold text-lg">{deal.title}</h3>
                <p className="text-white/80 text-sm">{deal.venues?.name}</p>
              </div>
            </div>

            {/* Deal Card Content */}
            <div className="p-4 space-y-3">
              <p className="text-white/80 text-sm">{deal.description}</p>

              {/* Promo Code Display */}
              {deal.promo_code && (
                <div className="bg-white/10 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs uppercase">Promo Code</span>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3 text-center">
                    <span className="text-white text-2xl font-bold tracking-widest">{deal.promo_code}</span>
                  </div>
                  <p className="text-white/60 text-xs text-center">Show this code at {deal.venues?.name}</p>
                </div>
              )}

              {/* CTA Button */}
              {deal.external_link ? (
                <a href={deal.external_link} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white rounded-full font-semibold">
                    {deal.cta_text || "Visit Venue"}
                  </Button>
                </a>
              ) : (
                <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white rounded-full font-semibold">
                  {deal.cta_text || "Redeem Deal"}
                </Button>
              )}

              {/* Expand/Collapse Button */}
              {deal.terms && (
                <>
                  <button
                    onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
                    className="w-full text-white/60 hover:text-white text-sm underline"
                  >
                    {isExpanded ? "Hide Details" : "View Terms & Conditions"}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-white/10 space-y-3">
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-2">Terms & Conditions</h4>
                        <p className="text-white/60 text-xs">{deal.terms}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
