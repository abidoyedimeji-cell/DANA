/**
 * Country dial codes for phone input (E.164).
 * Used by web signup to build full phone number matching signupSchema.
 */
export const COUNTRY_DIAL_CODES: { dialCode: string; label: string }[] = [
  { dialCode: "+44", label: "UK (+44)" },
  { dialCode: "+1", label: "US/Canada (+1)" },
  { dialCode: "+91", label: "India (+91)" },
  { dialCode: "+49", label: "Germany (+49)" },
  { dialCode: "+33", label: "France (+33)" },
  { dialCode: "+81", label: "Japan (+81)" },
  { dialCode: "+86", label: "China (+86)" },
  { dialCode: "+61", label: "Australia (+61)" },
  { dialCode: "+27", label: "South Africa (+27)" },
  { dialCode: "+254", label: "Kenya (+254)" },
  { dialCode: "+233", label: "Ghana (+233)" },
  { dialCode: "+353", label: "Ireland (+353)" },
  { dialCode: "+31", label: "Netherlands (+31)" },
  { dialCode: "+34", label: "Spain (+34)" },
  { dialCode: "+39", label: "Italy (+39)" },
  { dialCode: "+55", label: "Brazil (+55)" },
  { dialCode: "+52", label: "Mexico (+52)" },
  { dialCode: "+971", label: "UAE (+971)" },
  { dialCode: "+966", label: "Saudi Arabia (+966)" },
  { dialCode: "+234", label: "Nigeria (+234)" },
  { dialCode: "+20", label: "Egypt (+20)" },
  { dialCode: "+212", label: "Morocco (+212)" },
  { dialCode: "+255", label: "Tanzania (+255)" },
  { dialCode: "+256", label: "Uganda (+256)" },
  { dialCode: "+237", label: "Cameroon (+237)" },
  { dialCode: "+225", label: "Ivory Coast (+225)" },
  { dialCode: "+213", label: "Algeria (+213)" },
  { dialCode: "+358", label: "Finland (+358)" },
  { dialCode: "+46", label: "Sweden (+46)" },
  { dialCode: "+47", label: "Norway (+47)" },
  { dialCode: "+45", label: "Denmark (+45)" },
  { dialCode: "+32", label: "Belgium (+32)" },
  { dialCode: "+41", label: "Switzerland (+41)" },
  { dialCode: "+43", label: "Austria (+43)" },
  { dialCode: "+48", label: "Poland (+48)" },
  { dialCode: "+351", label: "Portugal (+351)" },
  { dialCode: "+90", label: "Turkey (+90)" },
  { dialCode: "+82", label: "South Korea (+82)" },
  { dialCode: "+65", label: "Singapore (+65)" },
  { dialCode: "+60", label: "Malaysia (+60)" },
  { dialCode: "+63", label: "Philippines (+63)" },
  { dialCode: "+64", label: "New Zealand (+64)" },
  { dialCode: "+62", label: "Indonesia (+62)" },
  { dialCode: "+66", label: "Thailand (+66)" },
  { dialCode: "+84", label: "Vietnam (+84)" },
  { dialCode: "+972", label: "Israel (+972)" },
];

/** Build E.164 phone from dial code + national number (digits only from national). */
export function toE164(dialCode: string, nationalNumber: string): string {
  const digits = nationalNumber.replace(/\D/g, "");
  const codeDigits = dialCode.replace(/\D/g, "");
  return "+" + codeDigits + digits;
}
