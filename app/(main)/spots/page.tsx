"use client"

import { useState } from "react"
import { AppHeader } from "@/components/navigation/app-header"
import { VenuesTab } from "@/components/venues/venues-tab"
import { DealsTab } from "@/components/venues/deals-tab"

export default function SpotsPage() {
  const [activeTab, setActiveTab] = useState<"venues" | "deals">("venues")

  return (
    <div className="min-h-screen bg-black pb-20">
      <AppHeader title="Venues & Deals" showModeToggle={false} />

      {/* Tab Navigation */}
      <div className="sticky top-14 z-10 bg-black border-b border-white/10">
        <div className="flex">
          <button
            onClick={() => setActiveTab("venues")}
            className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "venues" ? "text-[#FF6B35] border-b-2 border-[#FF6B35]" : "text-white/60"
            }`}
          >
            Venues
          </button>
          <button
            onClick={() => setActiveTab("deals")}
            className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "deals" ? "text-[#FF6B35] border-b-2 border-[#FF6B35]" : "text-white/60"
            }`}
          >
            Deals
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "venues" ? <VenuesTab /> : <DealsTab />}
    </div>
  )
}
