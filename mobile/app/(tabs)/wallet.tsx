import { View, Text, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { theme } from "@/config/theme";

export default function WalletScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Wallet</Text>
      <Text style={styles.subtitle}>Top up and manage your DANA credits</Text>
      <View style={styles.card}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceValue}>—</Text>
        <Text style={styles.hint}>Connect to see your balance</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Top up and transaction history will appear here</Text>
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
    marginBottom: theme.spacing.lg,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: theme.colors.muted, fontSize: 14, marginTop: theme.spacing.sm },
  error: { color: theme.colors.destructive, fontSize: 14 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: theme.spacing.sm,
  },
  placeholder: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  placeholderText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
});
