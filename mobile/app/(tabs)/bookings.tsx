import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { getDateRequestsForUser } from "shared";
import type { DateRequest } from "shared";
import { theme } from "@/config/theme";

export default function BookingsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getDateRequestsForUser(supabase, user.id)
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load bookings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!user) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.muted}>Sign in to see your bookings.</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.muted}>Loading bookings…</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (requests.length === 0) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Bookings</Text>
        <View style={styles.centered}>
          <Text style={styles.muted}>No date requests yet.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Bookings</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.proposed_date} at {item.proposed_time}
            </Text>
            <Text style={styles.status}>Status: {item.status}</Text>
            {item.message ? (
              <Text style={styles.muted} numberOfLines={2}>{item.message}</Text>
            ) : null}
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "600", color: theme.colors.foreground, marginBottom: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: theme.colors.muted, fontSize: 14 },
  error: { color: theme.colors.destructive, fontSize: 14 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: theme.colors.foreground },
  status: { fontSize: 14, color: theme.colors.muted, marginTop: 4 },
});
