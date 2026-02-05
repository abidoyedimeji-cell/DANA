"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, MapPin, Star, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { getVenues, createVenue, updateVenue, deleteVenue } from "@/lib/actions/venue-actions"
import { AppHeader } from "@/components/navigation/app-header"

export default function ManageVenuesPage() {
  const { user } = useAuth()
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvData, setCsvData] = useState("")
  const [editingVenue, setEditingVenue] = useState<any>(null)
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

  useEffect(() => {
    loadVenues()
  }, [])

  const loadVenues = async () => {
    setLoading(true)
    const data = await getVenues()
    setVenues(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const venueData = {
        ...formData,
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        rating: Number.parseFloat(formData.rating.toString()),
        price_range: Number.parseInt(formData.price_range.toString()),
      }

      if (editingVenue) {
        await updateVenue(editingVenue.id, venueData)
      } else {
        await createVenue(venueData)
      }

      await loadVenues()
      resetForm()
    } catch (error) {
      console.error("Error saving venue:", error)
      alert("Failed to save venue")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this venue?")) return

    try {
      await deleteVenue(id)
      await loadVenues()
    } catch (error) {
      console.error("Error deleting venue:", error)
      alert("Failed to delete venue")
    }
  }

  const handleEdit = (venue: any) => {
    setEditingVenue(venue)
    setFormData({
      name: venue.name,
      description: venue.description || "",
      address: venue.address || "",
      city: venue.city || "London",
      category: venue.category || "",
      image_url: venue.image_url || "",
      rating: venue.rating || 4.5,
      price_range: venue.price_range || 2,
      features: venue.features?.join(", ") || "",
      promo_text: venue.promo_text || "",
      is_partner: venue.is_partner || false,
    })
    setShowForm(true)
  }

  const handleCsvImport = async () => {
    try {
      const lines = csvData.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim())

      let successCount = 0
      let errorCount = 0

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const venueData: any = {}

        headers.forEach((header, index) => {
          const value = values[index]

          if (header === "name") venueData.name = value
          else if (header === "description") venueData.description = value
          else if (header === "address") venueData.address = value
          else if (header === "city") venueData.city = value
          else if (header === "category") venueData.category = value
          else if (header === "image_url") venueData.image_url = value
          else if (header === "rating") venueData.rating = Number.parseFloat(value) || 4.5
          else if (header === "price_range") venueData.price_range = Number.parseInt(value) || 2
          else if (header === "features")
            venueData.features = value
              .split(";")
              .map((f) => f.trim())
              .filter(Boolean)
          else if (header === "promo_text") venueData.promo_text = value
          else if (header === "is_partner") venueData.is_partner = value.toLowerCase() === "true"
        })

        try {
          await createVenue(venueData)
          successCount++
        } catch (error) {
          console.error("Error importing venue:", error)
          errorCount++
        }
      }

      alert(`Import complete!\nSuccessful: ${successCount}\nFailed: ${errorCount}`)
      await loadVenues()
      setShowCsvImport(false)
      setCsvData("")
    } catch (error) {
      console.error("CSV import error:", error)
      alert("Failed to import CSV. Please check the format.")
    }
  }

  const resetForm = () => {
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
    setEditingVenue(null)
    setShowForm(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Please log in to access admin panel</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader title="Venue Management" showModeToggle={false} />

      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Venues ({venues.length})</h2>
          <div className="flex gap-2">
            <Button onClick={() => setShowCsvImport(!showCsvImport)} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Venue
            </Button>
          </div>
        </div>

        {showCsvImport && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold">Import Venues from CSV</h3>
            <p className="text-white/60 text-sm">
              CSV format:
              name,description,address,city,category,image_url,rating,price_range,features,promo_text,is_partner
              <br />
              Features should be semicolon-separated (e.g., "WiFi;Parking;Outdoor Seating")
            </p>
            <Textarea
              placeholder="Paste CSV data here..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[200px] font-mono text-xs"
            />
            <div className="flex gap-3">
              <Button onClick={handleCsvImport} className="bg-blue-600 hover:bg-blue-700 flex-1">
                Import
              </Button>
              <Button
                type="button"
                onClick={() => { setShowCsvImport(false); setCsvData("") }}
                variant="outline"
                className="border-white/10 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold">{editingVenue ? "Edit Venue" : "Add New Venue"}</h3>

            <Input
              placeholder="Venue Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-white/5 border-white/10 text-white"
            />

            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />

            <Input
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                placeholder="Category (e.g. Restaurant, Bar)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <Input
              placeholder="Image URL"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.1"
                placeholder="Rating (1-5)"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number.parseFloat(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                type="number"
                placeholder="Price Range (1-4)"
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: Number.parseInt(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <Input
              placeholder="Features (comma separated)"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />

            <Input
              placeholder="Promo Text"
              value={formData.promo_text}
              onChange={(e) => setFormData({ ...formData, promo_text: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.is_partner}
                onChange={(e) => setFormData({ ...formData, is_partner: e.target.checked })}
                className="w-4 h-4"
              />
              Partner Venue
            </label>

            <div className="flex gap-3">
              <Button type="submit" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 flex-1">
                {editingVenue ? "Update Venue" : "Create Venue"}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline" className="border-white/10 bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-white/60 text-center py-8">Loading venues...</p>
        ) : venues.length === 0 ? (
          <p className="text-white/60 text-center py-8">No venues yet. Add your first venue!</p>
        ) : (
          <div className="space-y-4">
            {venues.map((venue) => (
              <div key={venue.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex gap-4 p-4">
                  <img
                    src={venue.image_url || "/placeholder.svg?height=100&width=100"}
                    alt={venue.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{venue.name}</h3>
                        <p className="text-white/60 text-sm">{venue.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(venue)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(venue.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {venue.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {venue.rating}
                      </div>
                      <div>{"£".repeat(venue.price_range || 2)}</div>
                      {venue.is_partner && (
                        <div className="bg-[#FF6B35] text-white text-xs px-2 py-0.5 rounded-full">Partner</div>
                      )}
                    </div>

                    {venue.description && <p className="text-white/80 text-sm line-clamp-2">{venue.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
