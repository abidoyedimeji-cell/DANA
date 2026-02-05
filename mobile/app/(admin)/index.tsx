import React, { useEffect, useState } from "react";
import { Alert, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { theme } from "@/config/theme";
import { logger } from "shared";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/components/providers/AuthProvider";
import { Input } from "@/components/Input";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const { user, refreshProfile } = useAuth();
  const [targetUserId, setTargetUserId] = useState("");

  useEffect(() => {
    logger.info("Admin Dashboard accessed");
  }, []);

  const handleForceVerify = async () => {
    const userId = targetUserId.trim() || user?.id;
    if (!userId) {
      Alert.alert("Missing user", "Enter a user id or sign in.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: true, verification_method: "admin_manual" })
      .eq("id", userId);
    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }
    await refreshProfile();
    Alert.alert("Verified", "User has been marked as verified.");
  };

  const stats = [
    { id: "1", label: "Total Users", value: "1,240", icon: "people" },
    { id: "2", label: "Active Sessions", value: "85", icon: "pulse" },
    { id: "3", label: "Pending Reports", value: "12", icon: "warning" },
  ];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.id} style={styles.statCard}>
            <Ionicons name={item.icon as never} size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>System Management</Text>

      <TouchableOpacity style={styles.menuItem} onPress={() => logger.debug("User Management clicked")}>
        <View style={styles.menuLeft}>
          <Ionicons name="person-outline" size={20} color={theme.colors.foreground} />
          <Text style={styles.menuText}>User Management</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuLeft}>
          <Ionicons name="settings-outline" size={20} color={theme.colors.foreground} />
          <Text style={styles.menuText}>System Config</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Verification</Text>
      <Input
        label="Target user id (optional)"
        value={targetUserId}
        onChangeText={setTargetUserId}
        placeholder={user?.id ?? "User id"}
        containerStyle={styles.inputContainer}
      />
      <TouchableOpacity style={styles.verifyButton} onPress={handleForceVerify}>
        <Text style={styles.verifyButtonText}>Force Verify User</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.foreground,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    width: "31%",
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.foreground,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.muted,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  menuText: {
    fontSize: 16,
    color: theme.colors.foreground,
  },
  inputContainer: {
    marginTop: theme.spacing.md,
  },
  verifyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  verifyButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
});
