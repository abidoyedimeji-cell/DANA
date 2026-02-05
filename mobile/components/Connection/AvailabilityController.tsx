import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import type { AvailabilityView } from "shared";

interface AvailabilityControllerProps {
  view: AvailabilityView;
  onViewChange: (view: AvailabilityView) => void;
  receiverName?: string;
}

export const AvailabilityController: React.FC<AvailabilityControllerProps> = ({
  view,
  onViewChange,
  receiverName = "User B",
}) => {
  const options: { value: AvailabilityView; label: string; icon: string }[] = [
    { value: "both", label: "Both", icon: "people" },
    { value: "userB", label: receiverName.split(" ")[0], icon: "person" },
    { value: "userA", label: "You", icon: "person-outline" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Viewing Availability For:</Text>
      <View style={styles.segmentedControl}>
        {options.map((option) => {
          const isSelected = view === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.segment, isSelected && styles.segmentActive]}
              onPress={() => onViewChange(option.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon as any}
                size={14}
                color={isSelected ? theme.colors.primaryForeground : theme.colors.muted}
              />
              <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    padding: 2,
    gap: 2,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    gap: 4,
  },
  segmentActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentText: {
    fontSize: 12,
    color: theme.colors.muted,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: theme.colors.primaryForeground,
  },
});
