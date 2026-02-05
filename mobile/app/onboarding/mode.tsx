import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/components/providers/AuthProvider";
import { ScreenContainer } from "@/components/ScreenContainer";
import { theme } from "@/config/theme";
import type { ProfileMode } from "shared";

const MODES: { id: ProfileMode; label: string }[] = [
  { id: "dating", label: "Dating" },
  { id: "business", label: "Business" },
  { id: "both", label: "Both" },
];

export default function OnboardingModeScreen() {
  const { setProfileMode } = useAuth();

  const handleSelect = async (mode: ProfileMode) => {
    await setProfileMode(mode);
    router.replace("/onboarding/profile");
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Choose your mode</Text>
      <Text style={styles.subtitle}>You can change this later in settings.</Text>
      {MODES.map((m) => (
        <TouchableOpacity
          key={m.id}
          style={styles.button}
          onPress={() => handleSelect(m.id)}
        >
          <Text style={styles.buttonText}>{m.label}</Text>
        </TouchableOpacity>
      ))}
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
    marginBottom: theme.spacing.sm,
  },
  buttonText: { color: theme.colors.primaryForeground, fontSize: 16, fontWeight: "600" },
});
