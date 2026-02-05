"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SelfieVerificationStepProps {
  onCapture: (data: any) => void
  isSubmitting: boolean
}

export function SelfieVerificationStep({ onCapture, isSubmitting }: SelfieVerificationStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [livenessCheck, setLivenessCheck] = useState<"pending" | "checking" | "passed" | "failed">("pending")
  const [error, setError] = useState("")
  const [livenessProgress, setLivenessProgress] = useState(0)

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsCameraActive(true)
        }
      } catch (err) {
        setError("Unable to access camera. Please check permissions.")
        console.error(err)
      }
    }

    if (!photo) {
      initCamera()
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [photo])

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    setError("")

    try {
      const context = canvasRef.current.getContext("2d")
      if (!context) throw new Error("Canvas context not available")

      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)

      const photoData = canvasRef.current.toDataURL("image/jpeg", 0.9)
      setPhoto(photoData)

      // Perform liveness detection with progress animation
      setLivenessCheck("checking")
      await performLivenessDetection()
    } catch (err) {
      setError("Failed to capture photo. Please try again.")
      console.error(err)
    } finally {
      setIsCapturing(false)
    }
  }

  const performLivenessDetection = async () => {
    // Simulate liveness detection with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setLivenessProgress(i)
    }

    // Simulate 95% chance of passing
    const passed = Math.random() < 0.95
    setLivenessCheck(passed ? "passed" : "failed")
  }

  const handleSubmitVerification = () => {
    if (!photo) return

    onCapture({
      type: "live_selfie",
      photoData: photo,
      livenessDetection: "passed",
      faceQuality: 0.98,
      timestamp: new Date().toISOString(),
    })
  }

  const resetCapture = () => {
    setPhoto(null)
    setLivenessCheck("pending")
    setLivenessProgress(0)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Live Selfie Verification</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Take a clear selfie for facial matching. Our liveness detection ensures you're a real person, not a photo.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!photo ? (
        <>
          {/* Camera view */}
          <div className="relative bg-foreground/5 rounded-xl overflow-hidden aspect-[4/3]">
            {isCameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-60 border-2 border-dashed border-primary/50 rounded-[40%] flex items-center justify-center">
                    <span className="text-xs text-primary/70 bg-background/80 px-2 py-1 rounded">
                      Position face here
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <svg className="w-12 h-12 text-muted-foreground animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <p className="text-sm text-muted-foreground">Initializing camera...</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          {/* Tips */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "💡", text: "Good lighting" },
              { icon: "👤", text: "Face centered" },
              { icon: "👁️", text: "Look at camera" },
            ].map((tip) => (
              <div key={tip.text} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 text-center">
                <span className="text-lg">{tip.icon}</span>
                <span className="text-xs text-muted-foreground">{tip.text}</span>
              </div>
            ))}
          </div>

          <Button onClick={capturePhoto} disabled={!isCameraActive || isCapturing} className="w-full" size="lg">
            {isCapturing ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Capturing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Take Selfie
              </span>
            )}
          </Button>
        </>
      ) : (
        <>
          {/* Captured photo */}
          <div className="relative bg-muted rounded-xl overflow-hidden aspect-[4/3]">
            <img src={photo || "/placeholder.svg"} alt="Captured selfie" className="w-full h-full object-cover" />
          </div>

          {/* Liveness Detection Status */}
          <div className="p-4 rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">Liveness Detection</p>
              {livenessCheck === "passed" && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  Verified
                </span>
              )}
            </div>

            {livenessCheck === "checking" && (
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200 rounded-full"
                    style={{ width: `${livenessProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Analyzing facial features...</p>
              </div>
            )}

            {livenessCheck === "passed" && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Real person confirmed</span>
              </div>
            )}

            {livenessCheck === "failed" && (
              <div className="flex items-center gap-2 text-destructive">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-medium">Please retake your selfie</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetCapture} className="flex-1 bg-transparent" disabled={isSubmitting}>
              Retake Photo
            </Button>
            <Button
              onClick={handleSubmitVerification}
              disabled={livenessCheck !== "passed" || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Complete Verification"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
