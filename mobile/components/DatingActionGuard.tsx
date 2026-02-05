import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/components/providers/AuthProvider";
import { theme } from "@/config/theme";

export function DatingActionGuard({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();

  if (!profile?.is_verified) {
    return (
      <View style={styles.lockedCard}>
        <View style={styles.lockedHeader}>
          <Ionicons name="lock-closed" size={20} color={theme.colors.muted} />
          <Text style={styles.lockedText}>Verified ID Required</Text>
        </View>
        <TouchableOpacity style={styles.verifyBtn} onPress={() => router.push("/verification/identity")}>
          <Text style={styles.verifyBtnText}>Get Verified to Book</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  lockedCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    gap: theme.spacing.md,
  },
  lockedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  lockedText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  verifyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  verifyBtnText: {
    color: theme.colors.primaryForeground,
    fontWeight: "600",
  },
});
