import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { theme } from "@/config/theme";

export default function IdentityVerificationScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Verify your identity</Text>
      <Text style={styles.subtitle}>
        Identity verification unlocks booking and dating features. We will guide you through an ID
        check and a quick selfie step.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
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
