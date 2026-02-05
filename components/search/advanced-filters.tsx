"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal, MapPin } from "lucide-react"

export interface SearchFilters {
  ageMin: number
  ageMax: number
  gender: string[]
  interests: string[]
  distance: number
  postcode: string
  sortBy: "distance" | "newest" | "activity"
  occupation: string
}

interface AdvancedFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

const INTERESTS = [
  "Travel",
  "Fitness",
  "Music",
  "Art",
  "Food",
  "Sports",
  "Reading",
  "Gaming",
  "Photography",
  "Dancing",
  "Cooking",
]

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  const handleApply = () => {
    onFiltersChange(localFilters)
  }

  const handleReset = () => {
    const defaultFilters: SearchFilters = {
      ageMin: 18,
      ageMax: 65,
      gender: [],
      interests: [],
      distance: 25,
      postcode: "",
      sortBy: "distance",
      occupation: "",
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const toggleGender = (gender: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      gender: prev.gender.includes(gender) ? prev.gender.filter((g) => g !== gender) : [...prev.gender, gender],
    }))
  }

  const toggleInterest = (interest: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <SlidersHorizontal className="h-4 w-4" />
          Advanced Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Search</SheetTitle>
          <SheetDescription>Filter and sort profiles to find your perfect match</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Age Range */}
          <div className="space-y-3">
            <Label>
              Age Range: {localFilters.ageMin} - {localFilters.ageMax}
            </Label>
            <div className="space-y-2">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    min={18}
                    max={localFilters.ageMax}
                    value={localFilters.ageMin}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({ ...prev, ageMin: Number.parseInt(e.target.value) || 18 }))
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    min={localFilters.ageMin}
                    max={100}
                    value={localFilters.ageMax}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({ ...prev, ageMax: Number.parseInt(e.target.value) || 65 }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <Label>Gender</Label>
            <div className="flex flex-wrap gap-2">
              {["Male", "Female", "Non-binary", "Other"].map((gender) => (
                <Button
                  key={gender}
                  type="button"
                  variant={localFilters.gender.includes(gender) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleGender(gender)}
                >
                  {gender}
                </Button>
              ))}
            </div>
          </div>

          {/* Location & Distance */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              placeholder="Enter postcode (e.g., SW1A 1AA)"
              value={localFilters.postcode}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, postcode: e.target.value }))}
            />
            <div className="space-y-2">
              <Label className="text-sm">
                Distance: {localFilters.distance === 100 ? "Unlimited" : `${localFilters.distance} miles`}
              </Label>
              <Slider
                value={[localFilters.distance]}
                onValueChange={([value]) => setLocalFilters((prev) => ({ ...prev, distance: value }))}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 mile</span>
                <span>Unlimited</span>
              </div>
            </div>
          </div>

          {/* Occupation */}
          <div className="space-y-3">
            <Label>Occupation</Label>
            <Input
              placeholder="e.g., Engineer, Teacher, Artist"
              value={localFilters.occupation}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, occupation: e.target.value }))}
            />
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <Button
                  key={interest}
                  type="button"
                  variant={localFilters.interests.includes(interest) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-3">
            <Label>Sort By</Label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value: "distance" | "newest" | "activity") =>
                setLocalFilters((prev) => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="newest">Newest Members</SelectItem>
                <SelectItem value="activity">Most Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1 bg-transparent">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
