import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { theme } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import type { MeetingRequest } from "shared";
// Simple date formatting (no external dependency)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${month} ${day} at ${displayHours}:${displayMinutes} ${ampm}`;
};

interface MeetingRequestNotificationProps {
  request: MeetingRequest;
  onAccept: () => void;
  onDecline: () => void;
  onViewProfile: () => void;
}

const INTENT_LABELS: Record<string, string> = {
  social: "Social Meet",
  business_mentorship: "Mentorship Request",
  business_investing: "Investment Inquiry",
  business_networking: "Networking Request",
};

const INTENT_ICONS: Record<string, string> = {
  social: "people",
  business_mentorship: "school",
  business_investing: "trending-up",
  business_networking: "business",
};

export const MeetingRequestNotification: React.FC<MeetingRequestNotificationProps> = ({
  request,
  onAccept,
  onDecline,
  onViewProfile,
}) => {
  const sender = request.sender;
  const venue = request.venue;
  
  // Determine if request is urgent (< 24 hours away)
  const isUrgent = request.proposed_time
    ? new Date(request.proposed_time).getTime() - Date.now() < 24 * 60 * 60 * 1000
    : false;
  
  // Contextual header based on intent type
  const isBusiness = request.intent_type.startsWith('business_');
  const contextualHeader = isBusiness
    ? sender?.headline || `${sender?.seniority_level || 'Professional'} • ${sender?.years_in_role || 0}y exp`
    : sender?.interests?.slice(0, 2).join(' • ') || sender?.bio_social?.substring(0, 50);

  return (
    <View style={[styles.card, isUrgent && styles.cardUrgent]}>
      {/* Urgency Badge */}
      {isUrgent && (
        <View style={styles.urgencyBadge}>
          <Ionicons name="time" size={12} color="#EF4444" />
          <Text style={styles.urgencyText}>Urgent</Text>
        </View>
      )}

      {/* Header: Sender Info */}
      <TouchableOpacity style={styles.header} onPress={onViewProfile} activeOpacity={0.7}>
        <Image
          source={{
            uri: sender?.avatar_url || "https://via.placeholder.com/50",
          }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.senderName}>{sender?.display_name || "DANA Member"}</Text>
          {/* Contextual Header */}
          {contextualHeader && (
            <Text style={styles.contextualHeader} numberOfLines={1}>
              {contextualHeader}
            </Text>
          )}
          <View style={styles.intentBadge}>
            <Ionicons
              name={INTENT_ICONS[request.intent_type] as any}
              size={12}
              color={theme.colors.primary}
            />
            <Text style={styles.intentText}>{INTENT_LABELS[request.intent_type]}</Text>
          </View>
        </View>
        {sender?.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color={theme.colors.primary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Message */}
      <View style={styles.messageSection}>
        <Text style={styles.messageText}>{request.message}</Text>
      </View>

      {/* Venue & Time Info */}
      {(venue || request.proposed_time) && (
        <View style={styles.detailsSection}>
          {venue && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={14} color={theme.colors.muted} />
              <Text style={styles.detailText}>{venue.name}</Text>
            </View>
          )}
          {request.proposed_time && (
            <View style={styles.detailRow}>
              <Ionicons name="time" size={14} color={theme.colors.muted} />
              <Text style={styles.detailText}>{formatDate(request.proposed_time)}</Text>
            </View>
          )}
          {request.meeting_window_preference && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={14} color={theme.colors.muted} />
              <Text style={styles.detailText}>Prefers: {request.meeting_window_preference}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={onDecline}
          activeOpacity={0.7}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={onAccept}
          activeOpacity={0.7}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>

      {/* Timestamp */}
      <Text style={styles.timestamp}>{formatDate(request.created_at)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  intentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  intentText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  messageSection: {
    marginBottom: theme.spacing.md,
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.primary,
  },
  messageText: {
    fontSize: 14,
    color: theme.colors.foreground,
    lineHeight: 20,
  },
  detailsSection: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  declineButtonText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
  },
  acceptButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "700",
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.muted,
    textAlign: "right",
  },
  cardUrgent: {
    borderColor: "#EF4444",
    borderWidth: 2,
    backgroundColor: theme.colors.card + "FF",
  },
  urgencyBadge: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: "#EF444420",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  urgencyText: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  contextualHeader: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs / 2,
    marginBottom: theme.spacing.xs,
    fontWeight: "500",
  },
});
