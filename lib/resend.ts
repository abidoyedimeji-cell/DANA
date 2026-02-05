import { Resend } from "resend"

let resendClient: Resend | null = null
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY)
} else if (typeof window === "undefined") {
  console.warn("RESEND_API_KEY is not set - email sending will be skipped")
}

export const resend = resendClient

export const EMAIL_FROM = "Abidoyedimeji@gmail.com"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.warn("Resend client not configured - skipping email send")
    return { success: false, error: new Error("RESEND_API_KEY is not set") }
  }
  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}
