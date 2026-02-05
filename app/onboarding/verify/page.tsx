"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IDScanStep } from "@/components/verification/id-scan-step"
import { SelfieVerificationStep } from "@/components/verification/selfie-verification-step"
import { VerificationComplete } from "@/components/verification/verification-complete"

type VerificationStep = "id" | "selfie" | "complete"

export default function VerifyPage() {
  const [currentStep, setCurrentStep] = useState<VerificationStep>("id")
  const [idData, setIdData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleIDCapture = async (data: any) => {
    setIdData(data)
    setCurrentStep("selfie")
  }

  const handleSelfieCapture = async (data: any) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    localStorage.setItem("isVerified", "true")
    setCurrentStep("complete")
    setIsSubmitting(false)
  }

  const handleSkip = () => {
    localStorage.setItem("isVerified", "false")
    console.log("[v0] Verify: skipping, navigating to /app")
    window.location.href = "/app"
  }

  const handleQuickVerify = () => {
    localStorage.setItem("isVerified", "true")
    console.log("[v0] Verify: quick verify activated")
    setCurrentStep("complete")
  }

  const steps = [
    { key: "id", label: "ID Scan", number: 1 },
    { key: "selfie", label: "Live Selfie", number: 2 },
    { key: "complete", label: "Complete", number: 3 },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        {currentStep !== "complete" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {steps.slice(0, 2).map((step, index) => (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        index < currentStepIndex
                          ? "bg-[#E91E8C] text-white"
                          : index === currentStepIndex
                            ? "bg-[#E91E8C] text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 2 && (
                    <div className={`flex-1 h-0.5 mx-4 ${index < currentStepIndex ? "bg-[#E91E8C]" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Identity Verification</CardTitle>
                <CardDescription>
                  {currentStep === "complete" ? "You're all set!" : "Complete verification to unlock full app access"}
                </CardDescription>
              </div>
              {currentStep !== "complete" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                  <span>Bank-level security</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {currentStep === "complete" ? (
              <VerificationComplete />
            ) : currentStep === "id" ? (
              <IDScanStep onCapture={handleIDCapture} />
            ) : (
              <SelfieVerificationStep onCapture={handleSelfieCapture} isSubmitting={isSubmitting} />
            )}

            {currentStep !== "complete" && (
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <Button onClick={handleQuickVerify} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Quick Verify (Beta Testing)
                </Button>
                <Button variant="ghost" onClick={handleSkip} className="w-full text-muted-foreground">
                  Skip for now (limited access)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security notice */}
        {currentStep !== "complete" && (
          <p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed">
            Your documents are encrypted and securely processed. We only use biometric data for identity verification,
            never for app login.
          </p>
        )}
      </div>
    </main>
  )
}
