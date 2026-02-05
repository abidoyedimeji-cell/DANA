import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/components/providers/AuthProvider";
import { ScreenContainer } from "@/components/ScreenContainer";
import { theme } from "@/config/theme";

function isAdmin(profile: { user_role?: string | null } | null): boolean {
  const role = profile?.user_role;
  return role === "admin" || role === "super_admin";
}

export default function SettingsScreen() {
  const { user, profile, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.muted}>Loading…</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.muted}>Sign in to access settings.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.value}>{user?.email ?? "—"}</Text>
          {profile?.username ? (
            <Text style={styles.value}>@{profile.username}</Text>
          ) : null}
        </View>
        {isAdmin(profile) ? (
          <TouchableOpacity
            style={[styles.button, styles.adminButton]}
            onPress={() => router.push("/(admin)")}
          >
            <Text style={styles.adminButtonText}>Admin</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  muted: {
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: 16,
    color: theme.colors.foreground,
  },
  button: {
    backgroundColor: theme.colors.destructive,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  adminButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  adminButtonText: {
    color: theme.colors.primaryForeground ?? "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonText: {
    color: theme.colors.destructiveForeground,
    fontSize: 16,
    fontWeight: "600",
  },
});
