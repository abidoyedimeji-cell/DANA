import { z } from "zod";

export const USER_ROLES = ["user", "admin", "super_admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PROFILE_MODES = ["dating", "business", "both"] as const;
export type ProfileMode = (typeof PROFILE_MODES)[number];

export const VERIFICATION_METHODS = ["none", "provider", "admin_manual", "dev_bypass"] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export const PROFESSIONAL_INTENTS = [
  "mentorship",
  "investing",
  "fundraising",
  "hiring",
  "job_opportunities",
  "networking",
  "cofounder",
  "advice",
] as const;
export type ProfessionalIntent = (typeof PROFESSIONAL_INTENTS)[number];

export const SENIORITY_LEVELS = ["junior", "mid", "senior", "executive", "founder"] as const;
export type SeniorityLevel = (typeof SENIORITY_LEVELS)[number];

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(20).nullable(),
  display_name: z.string().min(1).nullable(),
  first_name: z.string().min(1).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable(),
  bio_social: z.string().nullable().optional(),
  interests: z.array(z.string()).default([]).optional(),
  location: z.string().nullable().optional(),
  age: z.number().int().nullable().optional(),
  height: z.string().nullable().optional(),
  love_language: z.string().nullable().optional(),
  user_role: z.enum(USER_ROLES).default("user").optional(),
  profile_mode: z.enum(PROFILE_MODES).default("both"),
  is_verified: z.boolean().default(false),
  is_profile_complete: z.boolean().default(false),
  verification_method: z.enum(VERIFICATION_METHODS).default("none"),
  headline: z.string().nullable().optional(),
  bio_professional: z.string().nullable().optional(),
  professional_intents: z.array(z.string()).default([]).optional(),
  seniority_level: z.enum(SENIORITY_LEVELS).nullable().optional(),
  years_in_role: z.number().int().nullable().optional(),
  industry: z.string().nullable().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(z.unknown()).default([]),
  calendar_link_business: z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      // Auto-prepend https:// if missing
      const trimmed = val.trim();
      return trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    })
    .pipe(z.string().url().nullable().optional()),
  calendar_link_social: z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      // Auto-prepend https:// if missing
      const trimmed = val.trim();
      return trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    })
    .pipe(z.string().url().nullable().optional()),
  availability_sync_provider: z.enum(['link', 'google', 'outlook', 'calendly', 'cal_com']).default('link').optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export function hasAdminAccess(role?: string | null): boolean {
  return role === "admin" || role === "super_admin";
}
