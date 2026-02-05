import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { theme } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppContextMode } from "@/components/providers/ContextModeProvider";
import { supabase } from "@/lib/supabase";
import { createMeetingRequest, getVenuesBySuitability, type AvailabilityView } from "shared";
import { getAvailableSlots } from "@/utils/availability";
import { AvailabilityController } from "./AvailabilityController";
import type { Venue, MeetingRequestIntent, Profile } from "shared";

interface ConnectionRequestModalProps {
  visible: boolean;
  receiverId: string;
  receiverName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const INTENT_OPTIONS: { value: MeetingRequestIntent; label: string; icon: string }[] = [
  { value: "social", label: "Social Meet", icon: "people" },
  { value: "business_mentorship", label: "Mentorship", icon: "school" },
  { value: "business_investing", label: "Investment", icon: "trending-up" },
  { value: "business_networking", label: "Networking", icon: "business" },
];

export const ConnectionRequestModal: React.FC<ConnectionRequestModalProps> = ({
  visible,
  receiverId,
  receiverName,
  onClose,
  onSuccess,
}) => {
  const { user, profile: requesterProfile } = useAuth();
  const { mode } = useAppContextMode();
  const [selectedIntent, setSelectedIntent] = useState<MeetingRequestIntent>("social");
  const [message, setMessage] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Calendar integration state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [receiverProfile, setReceiverProfile] = useState<Profile | null>(null);
  const [hasCalendarLink, setHasCalendarLink] = useState(false);
  const [venueHours, setVenueHours] = useState<{ opens_at: string; closes_at: string } | null>(null);
  const [availabilityView, setAvailabilityView] = useState<AvailabilityView>("both");

  // Load receiver profile to check for calendar link
  useEffect(() => {
    if (visible && receiverId) {
      loadReceiverProfile();
    }
  }, [visible, receiverId]);

  // Load context-appropriate venues
  useEffect(() => {
    if (visible) {
      loadVenues();
    }
  }, [visible, mode]);

  // Load available slots when date/venue/view changes
  useEffect(() => {
    if (visible && receiverId && receiverProfile) {
      loadAvailableSlots();
    }
  }, [visible, selectedDate, selectedVenue, receiverId, receiverProfile, mode, availabilityView]);

  const loadReceiverProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", receiverId)
        .single();
      
      if (data) {
        const profile = data as Profile;
        setReceiverProfile(profile);
        const calendarLink = mode === 'business' 
          ? profile.calendar_link_business 
          : profile.calendar_link_social;
        setHasCalendarLink(!!calendarLink);
      }
    } catch (error) {
      console.error("Failed to load receiver profile:", error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!receiverProfile) return;
    
    setLoadingSlots(true);
    try {
      // Get venue hours if venue selected
      let hours = null;
      if (selectedVenue?.id) {
        const { data } = await supabase
          .from("venue_hours")
          .select("opens_at, closes_at")
          .eq("venue_id", selectedVenue.id)
          .eq("day_of_week", selectedDate.getDay())
          .single();
        hours = data;
        setVenueHours(hours);
      }

      // MUTUAL AVAILABILITY: Pass requester info to check both users' calendars
      // Include perspective view for filtering
      const slots = await getAvailableSlots(
        receiverId,
        selectedDate,
        mode,
        receiverProfile,
        hours || undefined,
        user?.id || null, // Requester ID
        requesterProfile || null, // Requester profile
        availabilityView // Perspective view
      );
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Failed to load slots:", error);
      setAvailableSlots([]); // Fallback to manual
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadVenues = async () => {
    setLoadingVenues(true);
    try {
      const tags = mode === "business" ? ["business"] : ["social"];
      const data = await getVenuesBySuitability(supabase, tags);
      setVenues(data as Venue[]);
    } catch (error) {
      console.error("Failed to load venues:", error);
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !message.trim()) {
      Alert.alert("Required", "Please enter a message explaining why you'd like to meet.");
      return;
    }

    // If calendar link exists, require time selection
    if (hasCalendarLink && !selectedTime) {
      Alert.alert("Required", "Please select an available time slot.");
      return;
    }

    setSubmitting(true);
    try {
      await createMeetingRequest(supabase, user.id, {
        receiver_id: receiverId,
        intent_type: selectedIntent,
        venue_id: selectedVenue?.id ?? null,
        proposed_time: selectedTime?.toISOString() ?? null,
        message: message.trim(),
        duration_minutes: 60, // Default 60 minutes for business, could be configurable
      });

      Alert.alert("Request Sent", `Your meeting request has been sent to ${receiverName}.`, [
        { text: "OK", onPress: () => {
          onSuccess();
          onClose();
          setMessage("");
          setSelectedVenue(null);
          setSelectedTime(null);
          setSelectedDate(new Date());
        }},
      ]);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeSlot = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatDate = (date: Date): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Request to Meet</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>Requesting to meet: {receiverName}</Text>

            {/* Intent Selection */}
            <Text style={styles.label}>I'm interested in:</Text>
            <View style={styles.intentGrid}>
              {INTENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSelectedIntent(option.value)}
                  style={[
                    styles.intentChip,
                    selectedIntent === option.value && styles.intentChipActive,
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={selectedIntent === option.value ? theme.colors.primaryForeground : theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.intentText,
                      selectedIntent === option.value && styles.intentTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Message */}
            <Text style={styles.label}>Briefly explain why you'd like to meet *</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="e.g., I'd love to learn about your experience in..."
              placeholderTextColor={theme.colors.muted}
              multiline
              numberOfLines={4}
              maxLength={300}
            />

            {/* Venue Suggestion */}
            <Text style={styles.label}>Suggested Venue (Optional)</Text>
            {loadingVenues ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.venueScroll}>
                {venues.slice(0, 5).map((venue) => (
                  <TouchableOpacity
                    key={venue.id}
                    onPress={() => setSelectedVenue(venue)}
                    style={[
                      styles.venueCard,
                      selectedVenue?.id === venue.id && styles.venueCardActive,
                    ]}
                  >
                    <Text style={styles.venueName} numberOfLines={1}>
                      {venue.name}
                    </Text>
                    <Text style={styles.venueCategory} numberOfLines={1}>
                      {venue.category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {selectedVenue && (
              <View style={styles.selectedVenue}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <Text style={styles.selectedVenueText}>{selectedVenue.name}</Text>
              </View>
            )}

            {/* Date Selection */}
            <Text style={styles.label}>Select Date</Text>
            <View style={styles.dateRow}>
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                const date = new Date();
                date.setDate(date.getDate() + offset);
                const isSelected = selectedDate.toDateString() === date.toDateString();
                return (
                  <TouchableOpacity
                    key={offset}
                    onPress={() => {
                      setSelectedDate(date);
                      setSelectedTime(null); // Reset time when date changes
                    }}
                    style={[styles.dateChip, isSelected && styles.dateChipActive]}
                  >
                    <Text style={[styles.dateChipText, isSelected && styles.dateChipTextActive]}>
                      {offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : formatDate(date)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Selection (Calendar Sync or Manual) */}
            {hasCalendarLink ? (
              <>
                <Text style={styles.label}>Select Available Time *</Text>
                {/* Availability Perspective Controller */}
                <AvailabilityController
                  view={availabilityView}
                  onViewChange={setAvailabilityView}
                  receiverName={receiverName}
                />
                {user && (
                  <Text style={styles.hint}>
                    {availabilityView === "both"
                      ? `Showing times when both you and ${receiverName} are available`
                      : availabilityView === "userB"
                      ? `Showing ${receiverName}'s available times`
                      : "Showing your available times"}
                  </Text>
                )}
                {loadingSlots ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Checking mutual availability...</Text>
                  </View>
                ) : availableSlots.length > 0 ? (
                  <>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTime?.getTime() === slot.getTime();
                        return (
                          <TouchableOpacity
                            key={slot.getTime()}
                            onPress={() => setSelectedTime(slot)}
                            style={[styles.timeSlot, isSelected && styles.timeSlotActive]}
                          >
                            <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                              {formatTimeSlot(slot)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                    {selectedTime && (
                      <View style={styles.selectedTime}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                        <Text style={styles.selectedTimeText}>
                          {formatTimeSlot(selectedTime)} on {formatDate(selectedDate)}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.hint}>
                    No available slots for this date. Try a different date or venue.
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.label}>Propose a Time (Optional)</Text>
                <Text style={styles.hint}>
                  {receiverName} hasn't linked a calendar. You can suggest a time, and they'll confirm manually.
                </Text>
                <View style={styles.manualTimeRow}>
                  <View style={styles.manualTimeInput}>
                    <Text style={styles.manualTimeLabel}>Date</Text>
                    <TextInput
                      style={styles.manualTimeText}
                      value={selectedDate.toISOString().split("T")[0]}
                      onChangeText={(text) => {
                        const date = new Date(text);
                        if (!isNaN(date.getTime())) setSelectedDate(date);
                      }}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={theme.colors.muted}
                    />
                  </View>
                  <View style={styles.manualTimeInput}>
                    <Text style={styles.manualTimeLabel}>Time</Text>
                    <TextInput
                      style={styles.manualTimeText}
                      value={selectedTime ? formatTimeSlot(selectedTime) : ""}
                      onChangeText={(text) => {
                        // Parse time input (e.g., "2:00 PM")
                        // For now, just allow manual entry
                      }}
                      placeholder="2:00 PM"
                      placeholderTextColor={theme.colors.muted}
                    />
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, (!message.trim() || submitting) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!message.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
              ) : (
                <Text style={styles.submitButtonText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  content: {
    padding: theme.spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  intentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  intentChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.input,
    gap: theme.spacing.xs,
  },
  intentChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  intentText: {
    fontSize: 12,
    color: theme.colors.muted,
    fontWeight: "600",
  },
  intentTextActive: {
    color: theme.colors.primaryForeground,
  },
  messageInput: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.foreground,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  venueScroll: {
    marginVertical: theme.spacing.sm,
  },
  venueCard: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    width: 150,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  venueCardActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  venueName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  venueCategory: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  selectedVenue: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.sm,
  },
  selectedVenueText: {
    fontSize: 12,
    color: theme.colors.foreground,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "700",
  },
  dateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dateChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateChipText: {
    fontSize: 12,
    color: theme.colors.muted,
    fontWeight: "600",
  },
  dateChipTextActive: {
    color: theme.colors.primaryForeground,
  },
  timeScroll: {
    marginVertical: theme.spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  timeSlotActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeSlotText: {
    fontSize: 13,
    color: theme.colors.foreground,
    fontWeight: "600",
  },
  timeSlotTextActive: {
    color: theme.colors.primaryForeground,
  },
  selectedTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.sm,
  },
  selectedTimeText: {
    fontSize: 12,
    color: theme.colors.foreground,
    fontWeight: "600",
  },
  loader: {
    marginVertical: theme.spacing.md,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.muted,
    fontStyle: "italic",
  },
  manualTimeRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  manualTimeInput: {
    flex: 1,
  },
  manualTimeLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
  },
  manualTimeText: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    color: theme.colors.foreground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.muted,
    fontStyle: "italic",
    marginTop: theme.spacing.xs,
  },
});
