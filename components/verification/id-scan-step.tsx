"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface IDScanStepProps {
  onCapture: (data: any) => void
}

export function IDScanStep({ onCapture }: IDScanStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [documentType, setDocumentType] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")
    setIsProcessing(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Simulate ID processing with AI/ML
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate document type detection
      const types = ["Passport", "Driver's License", "National ID"]
      setDocumentType(types[Math.floor(Math.random() * types.length)])
    } catch (err) {
      setError("Failed to process ID. Please try again.")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContinue = () => {
    if (preview) {
      onCapture({
        type: "government_id",
        preview,
        documentType,
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Scan Government ID</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Upload a clear photo of your government-issued ID. We accept passports, driver's licenses, and national ID
          cards.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload area */}
      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          preview ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
        } ${isProcessing ? "pointer-events-none opacity-70" : ""}`}
      >
        {preview ? (
          <div className="space-y-4 w-full">
            <div className="relative">
              <img
                src={preview || "/placeholder.svg"}
                alt="ID preview"
                className="w-full max-h-56 object-contain rounded-lg"
              />
              {documentType && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                  {documentType}
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Document uploaded successfully</span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or PDF (up to 10MB)</p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          disabled={isProcessing}
          className="hidden"
          onClick={(e) => {
            ;(e.target as HTMLInputElement).value = ""
          }}
        />
      </div>

      {/* Accepted documents */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "🪪", label: "Passport" },
          { icon: "🚗", label: "Driver's License" },
          { icon: "🆔", label: "National ID" },
        ].map((doc) => (
          <div key={doc.label} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 text-center">
            <span className="text-xl">{doc.icon}</span>
            <span className="text-xs text-muted-foreground">{doc.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {preview && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => {
              setPreview(null)
              setDocumentType(null)
            }}
            disabled={isProcessing}
          >
            Choose Different
          </Button>
        )}
        <Button onClick={handleContinue} disabled={!preview || isProcessing} className="flex-1">
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            "Continue to Selfie"
          )}
        </Button>
      </div>
    </div>
  )
}
