import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppContextMode } from "@/components/providers/ContextModeProvider";
import { BusinessProfileView } from "@/components/Business/BusinessProfileView";
import { theme } from "@/config/theme";
import type { Profile } from "shared";

function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function SocialProfileView({ profile, user }: { profile: Profile | null; user: any }) {
  const displayName = profile?.display_name ?? profile?.first_name ?? user?.email ?? "—";

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <ProfileField label="Display name" value={displayName} />
        <ProfileField label="Username" value={profile?.username ? `@${profile.username}` : undefined} />
        <ProfileField label="Email" value={user?.email ?? undefined} />
        <ProfileField label="Bio" value={profile?.bio_social ?? undefined} />
        <ProfileField label="Location" value={profile?.location ?? undefined} />
        {profile?.is_verified != null && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Verified</Text>
            <Text style={styles.fieldValue}>{profile.is_verified ? "Yes" : "No"}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default function ProfileScreen() {
  const { profile, user } = useAuth();
  const { mode } = useAppContextMode();
  const p = profile as Profile | null;

  return (
    <ScreenContainer>
      {mode === "social" ? (
        <SocialProfileView profile={p} user={user} />
      ) : (
        p && <BusinessProfileView profile={p} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: theme.spacing.xl },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: theme.colors.muted, fontSize: 14, marginTop: theme.spacing.sm },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  field: { marginBottom: theme.spacing.md },
  fieldLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
  },
  fieldValue: {
    fontSize: 16,
    color: theme.colors.foreground,
  },
});
