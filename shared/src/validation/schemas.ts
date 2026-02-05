import { z } from "zod";

// Auth schemas with enhanced validation
export const signupSchema = z.object({
  email: z.string().trim().email("Invalid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name is too long"),
  // Optional: allow omission; if provided, reject empty/whitespace-only
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name is too long").optional(),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Booking schemas with strict validation
export const dateInviteSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient ID"),
  venueId: z.string().uuid("Invalid venue ID"),
  dateTime: z.string().datetime("Invalid date time"),
  message: z.string().trim().max(500, "Message is too long").optional(),
});

export const bookingActionSchema = z
  .object({
    bookingId: z.string().uuid("Invalid booking ID"),
    action: z.enum(["accept", "decline", "cancel", "reschedule"]),
    reason: z.string().trim().max(500, "Reason is too long").optional(),
    newDateTime: z.string().datetime("Invalid date time").optional(),
  })
  // Use custom (not unrecognized_keys) for invalid field combinations
  .superRefine((data, ctx) => {
    if (data.action === "reschedule" && !data.newDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newDateTime"],
        message: "New date/time is required when rescheduling",
      });
    }
    if (data.action !== "reschedule" && data.newDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newDateTime"],
        message: "New date/time is only valid for reschedule actions",
      });
    }
  });

// Payment schemas
export const walletTopUpSchema = z.object({
  amount: z
    .number()
    .min(5, "Minimum top-up is £5")
    .max(500, "Maximum top-up is £500")
    .multipleOf(0.01, "Amount must be in valid currency format"),
});

// Trim + uppercase first; inner schema errors (e.g. min length) won't mention trim context
export const promoCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .pipe(
      z
        .string()
        .min(6, "Invalid promo code")
        .max(20, "Invalid promo code")
        .regex(/^[A-Z0-9]+$/, "Promo code must contain only uppercase letters and numbers")
    ),
});

// Subscription schemas
export const subscriptionSchema = z.object({
  planType: z.enum(["monthly", "yearly"]),
  priceId: z.string().startsWith("price_", "Invalid price ID"),
});

// Profile schemas
export const profileUpdateSchema = z.object({
  // Social fields
  display_name: z.string().trim().min(1).max(100).optional(),
  bio_social: z.string().trim().max(500).optional(),
  calendar_link_social: z
    .string()
    .trim()
    .url("Invalid URL")
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      const trimmed = val.trim();
      return trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    })
    .pipe(z.string().url().nullable().optional()),
  
  // Professional fields
  headline: z.string().trim().max(150).optional(),
  bio_professional: z.string().trim().max(1000).optional(),
  industry: z.string().trim().max(100).optional(),
  years_in_role: z.number().int().min(0).max(50).optional(),
  seniority_level: z.enum(["junior", "mid", "senior", "executive", "founder"]).optional(),
  professional_intents: z.array(z.string().trim()).max(10).optional(),
  calendar_link_business: z
    .string()
    .trim()
    .url("Invalid URL")
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      const trimmed = val.trim();
      return trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    })
    .pipe(z.string().url().nullable().optional()),
  
  // Basic fields
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  location: z.string().trim().max(100).optional(),
  interests: z.array(z.string().trim()).max(10).optional(),
  
  // Profile completion
  is_profile_complete: z.boolean().optional(),
  profile_mode: z.enum(["dating", "business", "both"]).optional(),
});

// Meeting request schemas (High-Intent Connection Engine)
export const meetingRequestIntentSchema = z.enum([
  "social",
  "business_mentorship",
  "business_investing",
  "business_networking",
]);

export const meetingRequestStatusSchema = z.enum(["pending", "accepted", "declined", "cancelled"]);

export const meetingRequestCreateSchema = z.object({
  receiver_id: z.string().uuid("Invalid receiver ID"),
  intent_type: meetingRequestIntentSchema,
  venue_id: z.string().uuid("Invalid venue ID").nullable().optional(),
  proposed_time: z.string().datetime("Invalid date time").nullable().optional(),
  message: z.string().trim().max(300, "Message too long").min(1, "Message required"),
  meeting_window_preference: z.string().trim().max(100).optional(),
});

export const meetingRequestUpdateSchema = z.object({
  status: meetingRequestStatusSchema,
  proposed_time: z.string().datetime("Invalid date time").nullable().optional(),
  message: z.string().trim().max(300).optional(),
});

// Venue schemas — lat/long optional when derived server-side from address
export const venueSchema = z.object({
  name: z.string().trim().min(1, "Venue name is required").max(100),
  address: z.string().trim().min(1, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(50),
  postcode: z
    .string()
    .trim()
    .regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, "Invalid UK postcode"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  category: z.enum(["restaurant", "bar", "cafe", "entertainment", "other"]),
});

// Venue hours + booking rules
export const venueHoursSchema = z.object({
  venue_id: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  opens_at: z.string().min(1),
  closes_at: z.string().min(1),
  is_closed: z.boolean().optional(),
});

export const venueBookingRulesSchema = z.object({
  venue_id: z.string().uuid(),
  timezone: z.string().min(1),
  capacity: z.number().int().min(1),
  turn_minutes: z.number().int().min(30),
  last_seating_time: z.string().min(1),
  enabled_booking_types: z.array(z.enum(["walk_in", "timed_table", "timed_room"])).optional(),
});

// ----- Domain enums (align with DB CHECK / RLS) -----
export const dateRequestStatusSchema = z.enum(["pending", "accepted", "declined", "cancelled", "completed"]);
export const verificationTypeSchema = z.enum(["id_scan", "selfie"]);
export const verificationStatusSchema = z.enum(["pending", "approved", "rejected"]);

// ----- EventSlot -----
export const eventSlotSchema = z.object({
  venue_id: z.string().uuid(),
  slot_start: z.string().datetime(),
  slot_end: z.string().datetime(),
  max_guests: z.number().int().min(1).max(20),
  is_available: z.boolean(),
});

export const reservationHoldSchema = z.object({
  venue_id: z.string().uuid(),
  reservation_type: z.enum(["timed_table", "timed_room"]),
  party_size: z.number().int().min(1),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  time_slot: z.string().min(1),
  expires_at: z.string().datetime(),
});

export const reservationSchema = z.object({
  venue_id: z.string().uuid(),
  reservation_type: z.enum(["walk_in", "timed_table", "timed_room"]),
  party_size: z.number().int().min(1),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  time_slot: z.string().min(1),
  status: z.enum(["confirmed", "cancelled"]).optional(),
});

// ----- DANA availability + booking -----
export const availabilityBlockSchema = z.object({
  user_id: z.string().uuid(),
  time_slot: z.string().min(1, "Time slot is required"),
  slot_type: z.enum(["one-off", "recurring"]).optional(),
});

export const danaIntersectionInputSchema = z.object({
  host_id: z.string().uuid(),
  guest_id: z.string().uuid(),
  venue_id: z.string().uuid(),
  meeting_duration: z.string().optional(),
});

export const danaHoldCreateSchema = z.object({
  host_id: z.string().uuid(),
  guest_id: z.string().uuid(),
  venue_id: z.string().uuid(),
  time_slot: z.string().min(1, "Time slot is required"),
  meeting_duration: z.string().optional(),
  hold_ttl: z.string().optional(),
});

export const checkAvailabilitySchema = z.object({
  venue_id: z.string().uuid(),
  start_at: z.string().datetime(),
  party_size: z.number().int().min(1),
});

// ----- DateRequest (create; aligns with date_invites) -----
export const dateRequestCreateSchema = z.object({
  invitee_id: z.string().uuid("Invalid invitee ID"),
  venue_id: z.string().uuid("Invalid venue ID").nullable(),
  proposed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  proposed_time: z.string().min(1, "Time is required"),
  message: z.string().trim().max(500).optional(),
});

// ----- DateRequest (update status / confirm) -----
export const dateRequestUpdateStatusSchema = z.object({
  status: dateRequestStatusSchema,
  reason: z.string().trim().max(500).optional(),
  new_proposed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  new_proposed_time: z.string().optional(),
});

// ----- Review (post-date) -----
export const reviewSchema = z.object({
  date_request_id: z.string().uuid(),
  reviewee_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

// ----- Verification -----
export const verificationSchema = z.object({
  profile_id: z.string().uuid(),
  type: verificationTypeSchema,
  status: verificationStatusSchema.optional(),
});
