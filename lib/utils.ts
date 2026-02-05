import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { sanitizeInput, RateLimiter } from "shared"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { sanitizeInput, RateLimiter }

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove inline event handlers
}
