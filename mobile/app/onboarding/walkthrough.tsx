import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/components/providers/AuthProvider";
import { theme } from "@/config/theme";

export default function OnboardingWalkthroughScreen() {
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoToApp = async () => {
    setLoading(true);
    try {
      await refreshProfile();
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>You're all set</Text>
      <Text style={styles.subtitle}>Start discovering and connecting.</Text>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGoToApp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
        ) : (
          <Text style={styles.buttonText}>Go to app</Text>
        )}
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "600", color: theme.colors.foreground, marginBottom: 8 },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginBottom: 24 },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: theme.colors.primaryForeground, fontSize: 16, fontWeight: "600" },
});
