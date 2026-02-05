"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Download, Upload, Loader2, Plus, Edit, Trash2, MapPin, Star } from "lucide-react"
import { getAdminVenues } from "@/lib/actions/admin-actions"
import { createVenue, updateVenue, deleteVenue } from "@/lib/actions/venue-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const EXPORT_FORMATS = [
  { label: "CSV", format: "csv" },
  { label: "Excel", format: "xlsx" },
  { label: "PDF", format: "pdf" },
  { label: "Word", format: "docx" },
] as const

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvData, setCsvData] = useState("")
  const [editingVenue, setEditingVenue] = useState<Record<string, unknown> | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "London",
    category: "",
    image_url: "",
    rating: 4.5,
    price_range: 2,
    features: "",
    promo_text: "",
    is_partner: true,
  })

  const loadVenues = async () => {
    setLoading(true)
    try {
      const data = await getAdminVenues()
      setVenues(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVenues()
  }, [])

  const handleExport = (format: string) => {
    window.open(`/api/admin/export/venues?format=${format}`, "_blank")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
        rating: Number(formData.rating),
        price_range: Number(formData.price_range),
      }
      if (editingVenue?.id) {
        await updateVenue(String(editingVenue.id), payload)
      } else {
        await createVenue(payload)
      }
      await loadVenues()
      setShowForm(false)
      setEditingVenue(null)
      setFormData({
        name: "",
        description: "",
        address: "",
        city: "London",
        category: "",
        image_url: "",
        rating: 4.5,
        price_range: 2,
        features: "",
        promo_text: "",
        is_partner: true,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this venue?")) return
    try {
      await deleteVenue(id)
      await loadVenues()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleEdit = (venue: Record<string, unknown>) => {
    setEditingVenue(venue)
    setFormData({
      name: String(venue.name ?? ""),
      description: String(venue.description ?? ""),
      address: String(venue.address ?? ""),
      city: String(venue.city ?? "London"),
      category: String(venue.category ?? ""),
      image_url: String(venue.image_url ?? ""),
      rating: Number(venue.rating ?? 4.5),
      price_range: Number(venue.price_range ?? 2),
      features: Array.isArray(venue.features) ? (venue.features as string[]).join(", ") : "",
      promo_text: String(venue.promo_text ?? ""),
      is_partner: Boolean(venue.is_partner ?? true),
    })
    setShowForm(true)
  }

  const handleCsvImport = async () => {
    const lines = csvData.split("\n").filter((l) => l.trim())
    const headers = lines[0].split(",").map((h) => h.trim())
    let ok = 0,
      fail = 0
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      const row: Record<string, unknown> = {}
      headers.forEach((h, idx) => {
        const v = values[idx]
        if (h === "name") row.name = v
        else if (h === "description") row.description = v
        else if (h === "address") row.address = v
        else if (h === "city") row.city = v
        else if (h === "category") row.category = v
        else if (h === "image_url") row.image_url = v
        else if (h === "rating") row.rating = parseFloat(v) || 4.5
        else if (h === "price_range") row.price_range = parseInt(v, 10) || 2
        else if (h === "features") row.features = v ? v.split(";").map((f) => f.trim()).filter(Boolean) : []
        else if (h === "promo_text") row.promo_text = v
        else if (h === "is_partner") row.is_partner = v?.toLowerCase() === "true"
      })
      try {
        await createVenue({
          name: String(row.name ?? ""),
          description: row.description as string | undefined,
          address: row.address as string | undefined,
          city: (row.city as string) || "London",
          category: row.category as string | undefined,
          image_url: row.image_url as string | undefined,
          rating: row.rating as number | undefined,
          price_range: row.price_range as number | undefined,
          features: (row.features as string[] | undefined),
          promo_text: row.promo_text as string | undefined,
          is_partner: Boolean(row.is_partner ?? true),
        })
        ok++
      } catch {
        fail++
      }
    }
    alert(`Import done. OK: ${ok}, Failed: ${fail}`)
    setShowCsvImport(false)
    setCsvData("")
    await loadVenues()
  }

  if (loading && venues.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Venues</h1>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setShowCsvImport(!showCsvImport)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          {EXPORT_FORMATS.map(({ label, format }) => (
            <Button
              key={format}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => handleExport(format)}
            >
              <Download className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => { setEditingVenue(null); setShowForm(!showForm); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add venue
          </Button>
        </div>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {showCsvImport && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Import from CSV</h3>
          <p className="text-white/60 text-sm mb-2">
            Headers: name,description,address,city,category,image_url,rating,price_range,features,promo_text,is_partner. Features semicolon-separated.
          </p>
          <Textarea
            placeholder="Paste CSV..."
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            className="bg-white/5 border-white/10 text-white min-h-[120px] mb-3"
          />
          <div className="flex gap-2">
            <Button onClick={handleCsvImport} className="bg-blue-600 hover:bg-blue-700">Import</Button>
            <Button variant="outline" className="border-white/20" onClick={() => { setShowCsvImport(false); setCsvData(""); }}>Cancel</Button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{editingVenue ? "Edit venue" : "New venue"}</h3>
          <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-white/5 border-white/10 text-white" />
          <Textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          <Input placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <Input placeholder="Image URL" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" step="0.1" placeholder="Rating" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.5 })} className="bg-white/5 border-white/10 text-white" />
            <Input type="number" placeholder="Price range" value={formData.price_range} onChange={(e) => setFormData({ ...formData, price_range: parseInt(e.target.value, 10) || 2 })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <Input placeholder="Features (comma)" value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          <Input placeholder="Promo text" value={formData.promo_text} onChange={(e) => setFormData({ ...formData, promo_text: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          <label className="flex items-center gap-2 text-white/80">
            <input type="checkbox" checked={formData.is_partner} onChange={(e) => setFormData({ ...formData, is_partner: e.target.checked })} className="w-4 h-4" />
            Partner
          </label>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">Save</Button>
            <Button type="button" variant="outline" className="border-white/20" onClick={() => { setShowForm(false); setEditingVenue(null); }}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/90">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {venues.length > 0 &&
                  Object.keys(venues[0] as Record<string, unknown>).map((key) => (
                    <th key={key} className="px-4 py-3 font-medium">
                      {key}
                    </th>
                  ))}
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  {row &&
                    Object.values(row as Record<string, unknown>).map((val, j) => (
                      <td key={j} className="px-4 py-2">
                        {val != null ? String(val) : "—"}
                      </td>
                    ))}
                  <td className="px-4 py-2">
                    <Button size="sm" variant="ghost" className="text-white/80" onClick={() => handleEdit(row)}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(String(row.id))}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-white/50 text-xs mt-4">{venues.length} rows</p>
    </div>
  )
}
