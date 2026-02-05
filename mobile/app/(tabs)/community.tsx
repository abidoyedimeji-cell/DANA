import { View, Text, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { theme } from "@/config/theme";

export default function CommunityScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>Posts and discussions</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Community feed will appear here</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xl,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: theme.colors.muted, fontSize: 14, marginTop: theme.spacing.sm },
  error: { color: theme.colors.destructive, fontSize: 14 },
  placeholder: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  placeholderText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
});
