export * from "../src/utils";
/**
 * Pure utilities shared between web and mobile (no DOM/RN-specific code).
 */

export * from "./export";
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests = 10,
    private windowMs = 60000
  ) {}

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter((time) => now - time < this.windowMs);
    if (recentRequests.length >= this.maxRequests) {
      return true;
    }
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return false;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}
