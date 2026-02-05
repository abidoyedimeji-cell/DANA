import { Redirect } from "expo-router";
import { Stack } from "expo-router";
import { useAuth } from "@/components/providers/AuthProvider";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "@/config/theme";

function isAdmin(profile: { user_role?: string | null } | null): boolean {
  const role = profile?.user_role;
  return role === "admin" || role === "super_admin";
}

export default function AdminLayout() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isAdmin(profile)) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: true, headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.foreground }}>
      <Stack.Screen name="index" options={{ title: "Admin" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});
