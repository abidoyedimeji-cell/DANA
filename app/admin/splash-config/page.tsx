"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function SplashConfigPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState({
    helloText: "Hello Gorgeous",
    helloDuration: 4,
    venue1Name: "Four Quarters Arcade",
    venue1Description: "Retro arcade bar • Fun interactive dates",
    venue1Image: "/colorful-arcade-gaming-space-neon-lights-retro-gam.jpg",
    venue1Tag: "FEATURED",
    venue2Name: "The Ivy Chelsea",
    venue2Description: "Elegant dining • Perfect for romantic evenings",
    venue2Image: "/elegant-restaurant-interior-dining-ambient-lightin.jpg",
    venue2Tag: "POPULAR",
    venue3Name: "ESPA Life at Corinthia",
    venue3Description: "Luxury spa • Couples treatments & relaxation",
    venue3Image: "/luxurious-spa-wellness-center-tranquil-atmosphere-s.jpg",
    venue3Tag: "WELLNESS",
    fadeDuration: 2,
  })
  const [saving, setSaving] = useState(false)

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
      loadConfig()
    }

    checkAccess()
  }, [router])

  const loadConfig = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("app_config").select("*").eq("key", "splash_screen").single()

    if (data?.value) {
      setConfig({ ...config, ...data.value })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    await supabase.from("app_config").upsert({
      key: "splash_screen",
      value: config,
      updated_at: new Date().toISOString(),
    })

    setSaving(false)
    alert("Splash screen configuration saved!")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Verifying access...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Splash Screen Configuration</h1>
        <p className="text-white/60 mb-8">Customize the loading sequence and featured venues</p>

        <div className="space-y-6">
          {/* Hello Screen Config */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Hello Screen</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Hello Text</Label>
                <Input
                  value={config.helloText}
                  onChange={(e) => setConfig({ ...config, helloText: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Duration (seconds)</Label>
                <Input
                  type="number"
                  value={config.helloDuration}
                  onChange={(e) => setConfig({ ...config, helloDuration: Number(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </Card>

          {/* Venue 1 Config */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Venue 1 (Arcade)</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Venue Name</Label>
                <Input
                  value={config.venue1Name}
                  onChange={(e) => setConfig({ ...config, venue1Name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Input
                  value={config.venue1Description}
                  onChange={(e) => setConfig({ ...config, venue1Description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Tag</Label>
                <Input
                  value={config.venue1Tag}
                  onChange={(e) => setConfig({ ...config, venue1Tag: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </Card>

          {/* Venue 2 Config */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Venue 2 (Restaurant)</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Venue Name</Label>
                <Input
                  value={config.venue2Name}
                  onChange={(e) => setConfig({ ...config, venue2Name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Input
                  value={config.venue2Description}
                  onChange={(e) => setConfig({ ...config, venue2Description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Tag</Label>
                <Input
                  value={config.venue2Tag}
                  onChange={(e) => setConfig({ ...config, venue2Tag: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </Card>

          {/* Venue 3 Config */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Venue 3 (Spa)</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Venue Name</Label>
                <Input
                  value={config.venue3Name}
                  onChange={(e) => setConfig({ ...config, venue3Name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Input
                  value={config.venue3Description}
                  onChange={(e) => setConfig({ ...config, venue3Description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Tag</Label>
                <Input
                  value={config.venue3Tag}
                  onChange={(e) => setConfig({ ...config, venue3Tag: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </Card>

          {/* Timing Config */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Timing</h2>
            <div>
              <Label className="text-white">Fade Duration Between Venues (seconds)</Label>
              <Input
                type="number"
                step="0.5"
                value={config.fadeDuration}
                onChange={(e) => setConfig({ ...config, fadeDuration: Number(e.target.value) })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </Card>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[var(--dana-yellow)] text-black hover:bg-[var(--dana-gold)] font-semibold"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>
    </div>
  )
}
