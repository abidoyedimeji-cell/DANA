/**
 * DANA design tokens – aligned with web app (globals.css).
 * Primary: pink; accent: gold/amber; dark background.
 */
export const theme = {
  colors: {
    background: "#0f172a",
    foreground: "#f8fafc",
    card: "#1e293b",
    cardForeground: "#f8fafc",
    primary: "#e879f9",
    primaryForeground: "#f8fafc",
    secondary: "#334155",
    secondaryForeground: "#f8fafc",
    muted: "#64748b",
    mutedForeground: "#94a3b8",
    accent: "#fbbf24",
    accentForeground: "#1e293b",
    destructive: "#f43f5e",
    destructiveForeground: "#f8fafc",
    border: "#334155",
    input: "#1e293b",
    ring: "#e879f9",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
} as const;
