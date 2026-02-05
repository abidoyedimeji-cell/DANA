import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent XSS
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove inline event handlers
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private maxRequests = 10,
    private windowMs = 60000,
  ) {}

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []

    // Filter out requests outside the time window
    const recentRequests = userRequests.filter((time) => now - time < this.windowMs)

    if (recentRequests.length >= this.maxRequests) {
      return true
    }

    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)

    return false
  }

  reset(identifier: string): void {
    this.requests.delete(identifier)
  }
}
