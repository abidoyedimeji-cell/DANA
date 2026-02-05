import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/components/providers/AuthProvider";
import { theme } from "@/config/theme";

export default function HomeScreen() {
  const { profile, user, isLoading } = useAuth();
  const displayName = profile?.display_name ?? profile?.first_name ?? user?.email ?? "there";

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
          <Text style={styles.muted}>Sign in to continue.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {displayName}</Text>
        <Text style={styles.subtitle}>DANA – Connect, Meet, Thrive</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.foreground,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: "center",
  },
  muted: {
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
});
