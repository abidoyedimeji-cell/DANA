import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { EmptyState } from "@/components/UI/EmptyState";
import { theme } from "@/config/theme";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { getPendingRequests, updateMeetingRequest } from "shared";
import { MeetingRequestNotification } from "@/components/Connection/MeetingRequestNotification";
import { router } from "expo-router";
import type { MeetingRequest } from "shared";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    try {
      const data = await getPendingRequests(supabase, user.id);
      
      // Priority sorting: Verified users first, then by proposed_time (soonest first)
      const sorted = [...data].sort((a, b) => {
        // Primary sort: Verified status (verified first)
        const aVerified = a.sender?.is_verified ? 1 : 0;
        const bVerified = b.sender?.is_verified ? 1 : 0;
        if (aVerified !== bVerified) {
          return bVerified - aVerified; // Descending: verified first
        }
        
        // Secondary sort: Proposed time (soonest first)
        if (a.proposed_time && b.proposed_time) {
          return new Date(a.proposed_time).getTime() - new Date(b.proposed_time).getTime();
        }
        if (a.proposed_time) return -1; // Has time comes first
        if (b.proposed_time) return 1;
        
        // Tertiary sort: Created time (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setRequests(sorted);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!user) return;
    try {
      await updateMeetingRequest(supabase, requestId, user.id, { status: "accepted" });
      await loadRequests();
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!user) return;
    try {
      await updateMeetingRequest(supabase, requestId, user.id, { status: "declined" });
      await loadRequests();
    } catch (error) {
      console.error("Failed to decline request:", error);
    }
  };

  const handleViewProfile = (profileId: string) => {
    router.push(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Meeting Requests</Text>
      <Text style={styles.subtitle}>High-intent connection requests</Text>
      {requests.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No pending requests"
          message="Meeting requests from other users will appear here. Check back later!"
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadRequests} />}
        >
          {requests.map((request) => (
            <MeetingRequestNotification
              key={request.id}
              request={request}
              onAccept={() => handleAccept(request.id)}
              onDecline={() => handleDecline(request.id)}
              onViewProfile={() => handleViewProfile(request.sender_id)}
            />
          ))}
        </ScrollView>
      )}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
});
