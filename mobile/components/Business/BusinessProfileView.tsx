import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import type { Profile } from "shared";

export const BusinessProfileView = ({ profile }: { profile: Profile }) => {
  return (
    <View style={styles.container}>
      {/* PROFESSIONAL IDENTITY HEADER */}
      <View style={styles.headerCard}>
        <Text style={styles.headline}>{profile.headline || "Professional Member"}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Ionicons name="briefcase-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.metaText}>{profile.industry || "General"}</Text>
          </View>
          {profile.seniority_level && (
            <View style={styles.metaBadge}>
              <Ionicons name="trending-up" size={14} color={theme.colors.primary} />
              <Text style={styles.metaText}>
                {profile.seniority_level} {profile.years_in_role ? `• ${profile.years_in_role} yrs` : ""}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* MARKETPLACE INTENTS (What I offer/need) */}
      {profile.professional_intents && profile.professional_intents.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Professional Intents</Text>
          <View style={styles.intentGrid}>
            {profile.professional_intents.map((intent) => (
              <View key={intent} style={styles.intentBadge}>
                <Ionicons name="radio-button-on" size={10} color={theme.colors.primary} />
                <Text style={styles.intentText}>{intent.replace("_", " ")}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* PROFESSIONAL BIO */}
      <Text style={styles.sectionLabel}>Overview</Text>
      <View style={styles.bioCard}>
        <Text style={styles.bioText}>
          {profile.bio_professional || "No professional bio provided."}
        </Text>
      </View>

      {/* ACTION TIER (Tier 3 Only) */}
      {profile.is_verified && (
        <TouchableOpacity style={styles.connectBtn}>
          <Text style={styles.connectText}>Request Introduction</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg },
  headerCard: { marginBottom: theme.spacing.xl },
  headline: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  metaRow: { flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    gap: theme.spacing.xs,
  },
  metaText: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
    textTransform: "capitalize",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    textTransform: "uppercase",
  },
  intentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  intentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232, 121, 249, 0.1)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(232, 121, 249, 0.3)",
  },
  intentText: {
    color: theme.colors.foreground,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  bioCard: {
    backgroundColor: theme.colors.input,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  bioText: {
    color: theme.colors.foreground,
    lineHeight: 22,
    fontSize: 15,
  },
  connectBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  connectText: {
    color: theme.colors.primaryForeground,
    fontWeight: "900",
    fontSize: 16,
  },
});
