import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { theme } from "@/config/theme";

// Stub: verification API (id/selfie) not wired yet; continues to walkthrough.
export default function OnboardingVerifyScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Verify your account</Text>
      <Text style={styles.subtitle}>We'll confirm your identity. You can do this later in settings.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/onboarding/walkthrough")}
      >
        <Text style={styles.buttonText}>Continue</Text>
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
  },
  buttonText: { color: theme.colors.primaryForeground, fontSize: 16, fontWeight: "600" },
});
