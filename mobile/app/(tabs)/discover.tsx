import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { supabase } from "@/lib/supabase";
import { getVenues } from "shared";
import type { Venue } from "shared";
import { theme } from "@/config/theme";

export default function DiscoverScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVenues(supabase)
      .then((data) => {
        if (!cancelled) setVenues(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load venues");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.muted}>Loading venues…</Text>
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

  if (venues.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.muted}>No venues yet. Check back later.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Discover</Text>
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.category ? (
              <Text style={styles.muted}>{item.category}</Text>
            ) : null}
            {item.rating != null ? (
              <Text style={styles.rating}>★ {item.rating}</Text>
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
  rating: { color: theme.colors.accent, fontSize: 14, marginTop: 4 },
});
