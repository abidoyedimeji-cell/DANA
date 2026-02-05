"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Upload, Plus, Trash2, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function AdminDealsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [deals, setDeals] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState<any>(null)
  const [formData, setFormData] = useState({
    venue_id: "",
    title: "",
    type: "discount",
    description: "",
    terms: "",
    promo_code: "",
    cta_text: "Get Deal",
    external_link: "",
    is_active: true,
  })

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("user_role").eq("id", user.id).single()

      if (!profile || profile.user_role !== "super_admin") {
        router.push("/app/profile")
        return
      }

      setIsLoading(false)
      loadDeals()
      loadVenues()
    }

    checkAccess()
  }, [router])

  const loadDeals = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("deals")
      .select("*, venues(name)")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setDeals(data)
    }
  }

  const loadVenues = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("venues").select("id, name").order("name")
    setVenues(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    if (editingDeal) {
      const { error } = await supabase.from("deals").update(formData).eq("id", editingDeal.id)
      if (!error) {
        alert("Deal updated successfully!")
        setShowForm(false)
        setEditingDeal(null)
        loadDeals()
      }
    } else {
      const { error } = await supabase.from("deals").insert([formData])
      if (!error) {
        alert("Deal created successfully!")
        setShowForm(false)
        loadDeals()
      }
    }

    setFormData({
      venue_id: "",
      title: "",
      type: "discount",
      description: "",
      terms: "",
      promo_code: "",
      cta_text: "Get Deal",
      external_link: "",
      is_active: true,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return

    const supabase = createClient()
    const { error } = await supabase.from("deals").delete().eq("id", id)

    if (!error) {
      alert("Deal deleted successfully!")
      loadDeals()
    }
  }

  const handleEdit = (deal: any) => {
    setEditingDeal(deal)
    setFormData({
      venue_id: deal.venue_id,
      title: deal.title,
      type: deal.type,
      description: deal.description,
      terms: deal.terms,
      promo_code: deal.promo_code || "",
      cta_text: deal.cta_text,
      external_link: deal.external_link || "",
      is_active: deal.is_active,
    })
    setShowForm(true)
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    const dealsToImport = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(",")
      const dealData: any = {
        venue_id: "",
        title: "",
        type: "discount",
        description: "",
        terms: "",
        cta_text: "Get Deal",
        is_active: true,
      }

      headers.forEach((header, index) => {
        const value = values[index]?.trim()
        if (!value) return

        if (header === "venue_name") {
          const venue = venues.find((v) => v.name.toLowerCase() === value.toLowerCase())
          if (venue) dealData.venue_id = venue.id
        } else if (header === "is_active") {
          dealData.is_active = value.toLowerCase() === "true"
        } else if (header in dealData) {
          dealData[header] = value
        }
      })

      if (dealData.venue_id && dealData.title) {
        dealsToImport.push(dealData)
      }
    }

    if (dealsToImport.length === 0) {
      alert("No valid deals found in CSV")
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("deals").insert(dealsToImport)

    if (error) {
      alert("Error importing deals: " + error.message)
    } else {
      alert(`Successfully imported ${dealsToImport.length} deals!`)
      loadDeals()
    }

    e.target.value = ""
  }

  const downloadCSVTemplate = () => {
    const template = `venue_name,title,type,description,terms,promo_code,cta_text,external_link,is_active
The Blue Lounge,20% OFF Happy Hour,discount,Enjoy 20% off all cocktails,Valid Monday-Friday only,DANA20,Get Deal Code,,true
Ember & Oak,Complimentary Dessert,complimentary,Free dessert with main course,Dine-in only,,Redeem Now,https://ember-oak.com,true`

    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "deals_template.csv"
    a.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Verifying access...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm -mx-6 -mt-6 px-6 py-4 mb-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-white/60 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Deals Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={downloadCSVTemplate}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Download Template
            </Button>
            <label className="cursor-pointer">
              <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-md hover:bg-white/10">
                <Upload className="w-4 h-4" />
                <span>Import CSV</span>
              </div>
            </label>
            <Button
              onClick={() => {
                setShowForm(!showForm)
                setEditingDeal(null)
                setFormData({
                  venue_id: "",
                  title: "",
                  type: "discount",
                  description: "",
                  terms: "",
                  promo_code: "",
                  cta_text: "Get Deal",
                  external_link: "",
                  is_active: true,
                })
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Button>
          </div>
        </div>
      </div>

      {/* Deal Form */}
      {showForm && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">{editingDeal ? "Edit Deal" : "Create New Deal"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Venue *</label>
                <select
                  value={formData.venue_id}
                  onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  required
                >
                  <option value="">Select venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  required
                >
                  <option value="discount">Discount</option>
                  <option value="complimentary">Complimentary</option>
                  <option value="credit">Credit</option>
                  <option value="special">Special Offer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                placeholder="e.g. 20% OFF Happy Hour"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                rows={3}
                placeholder="Describe the deal..."
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Terms & Conditions</label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                rows={2}
                placeholder="Valid Monday-Friday only..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Promo Code (optional)</label>
                <input
                  type="text"
                  value={formData.promo_code}
                  onChange={(e) => setFormData({ ...formData, promo_code: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  placeholder="DANA20"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">CTA Button Text</label>
                <input
                  type="text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  placeholder="Get Deal"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">External Link (optional)</label>
              <input
                type="url"
                value={formData.external_link}
                onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                placeholder="https://venue.com"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-white/80 text-sm">Active</label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600">
                {editingDeal ? "Update Deal" : "Create Deal"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingDeal(null)
                }}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Deals List */}
      <div className="space-y-4">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-white">{deal.title}</h3>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">{deal.type}</span>
                  {!deal.is_active && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">Inactive</span>
                  )}
                </div>
                <p className="text-white/60 text-sm mb-1">{deal.venues?.name}</p>
                <p className="text-white/80 text-sm">{deal.description}</p>
                {deal.promo_code && (
                  <p className="text-yellow-400 text-sm mt-2">
                    Code: <span className="font-mono font-bold">{deal.promo_code}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(deal)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(deal.id)}
                  className="p-2 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {deals.length === 0 && (
          <div className="text-center py-12 text-white/60">
            <p>No deals yet. Create your first deal or import from CSV.</p>
          </div>
        )}
      </div>
    </div>
  )
}
