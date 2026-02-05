import { z } from "zod"

// Auth schemas with enhanced validation
export const signupSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Booking schemas with strict validation
export const dateInviteSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient ID"),
  venueId: z.string().uuid("Invalid venue ID"),
  dateTime: z.string().datetime("Invalid date time"),
  message: z.string().max(500, "Message is too long").optional(),
})

export const bookingActionSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  action: z.enum(["accept", "decline", "cancel", "reschedule"]),
  reason: z.string().max(500, "Reason is too long").optional(),
  newDateTime: z.string().datetime().optional(),
})

// Payment schemas
export const walletTopUpSchema = z.object({
  amount: z
    .number()
    .min(5, "Minimum top-up is £5")
    .max(500, "Maximum top-up is £500")
    .multipleOf(0.01, "Amount must be in valid currency format"),
})

export const promoCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Invalid promo code")
    .max(20, "Invalid promo code")
    .regex(/^[A-Z0-9]+$/, "Promo code must contain only uppercase letters and numbers"),
})

// Subscription schemas
export const subscriptionSchema = z.object({
  planType: z.enum(["monthly", "yearly"]),
  priceId: z.string().startsWith("price_", "Invalid price ID"),
})

// Profile schemas
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  interests: z.array(z.string()).max(10).optional(),
})

// Venue schemas
export const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required").max(100),
  address: z.string().min(1, "Address is required").max(200),
  city: z.string().min(1, "City is required").max(50),
  postcode: z.string().regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, "Invalid UK postcode"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  category: z.enum(["restaurant", "bar", "cafe", "entertainment", "other"]),
})
