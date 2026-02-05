import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  console.warn("[DANA] RESEND_API_KEY is not set. Email features will not work.")
}

export const resend: Resend | null = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

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
    console.warn("[DANA] Email not sent – RESEND_API_KEY is not configured.")
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
