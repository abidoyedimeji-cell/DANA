import React, { memo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { theme } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import type { Profile } from "shared";

interface BusinessResultCardProps {
  profile: Profile;
  onPress: () => void;
  onRequestConnect?: () => void;
}

export const BusinessResultCard: React.FC<BusinessResultCardProps> = memo(({
  profile,
  onPress,
  onRequestConnect,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* 1. THE AUTHORITY COLUMN */}
      <View style={styles.avatarSection}>
        <Image
          source={{
            uri: profile.avatar_url || "https://via.placeholder.com/100",
          }}
          style={[
            styles.avatar,
            {
              borderColor: profile.is_verified ? theme.colors.primary : theme.colors.border,
            },
          ]}
        />
        {profile.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color={theme.colors.primaryForeground} />
          </View>
        )}
      </View>

      {/* 2. THE IDENTITY COLUMN */}
      <View style={styles.infoSection}>
        <Text style={styles.name} numberOfLines={1}>
          {profile.display_name || "DANA Member"}
        </Text>
        <Text style={styles.headline} numberOfLines={1}>
          {profile.headline || "DANA Member"}
        </Text>

        <View style={styles.metaRow}>
          {profile.industry && <Text style={styles.metaText}>{profile.industry}</Text>}
          {profile.industry && profile.years_in_role && (
            <Text style={styles.bullet}>•</Text>
          )}
          {profile.years_in_role && (
            <Text style={styles.metaText}>{profile.years_in_role}y Experience</Text>
          )}
        </View>

        {/* 3. THE INTENT CHIPS (Compact) */}
        {profile.professional_intents && profile.professional_intents.length > 0 && (
          <View style={styles.intentRow}>
            {profile.professional_intents.slice(0, 2).map((intent) => (
              <View key={intent} style={styles.intentTag}>
                <Text style={styles.intentTagText}>{intent.replace("_", " ")}</Text>
              </View>
            ))}
            {profile.professional_intents.length > 2 && (
              <Text style={styles.moreText}>+{profile.professional_intents.length - 2}</Text>
            )}
          </View>
        )}
      </View>

      {/* 4. THE INTERACTION COLUMN */}
      <View style={styles.actionSection}>
        {onRequestConnect && (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={onRequestConnect}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: Only re-render if the profile ID, verification status, or headline changes
  return (
    prevProps.profile.id === nextProps.profile.id &&
    prevProps.profile.is_verified === nextProps.profile.is_verified &&
    prevProps.profile.headline === nextProps.profile.headline &&
    prevProps.profile.display_name === nextProps.profile.display_name
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  avatarSection: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  infoSection: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  name: {
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
  headline: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "500",
    marginTop: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  metaText: {
    color: theme.colors.muted,
    fontSize: 11,
  },
  bullet: {
    color: theme.colors.muted,
    marginHorizontal: theme.spacing.xs,
  },
  intentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  intentTag: {
    backgroundColor: theme.colors.input,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  intentTagText: {
    color: theme.colors.mutedForeground,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  moreText: {
    color: theme.colors.muted,
    fontSize: 10,
    alignSelf: "center",
  },
  actionSection: {
    marginLeft: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  connectButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.input,
  },
});
