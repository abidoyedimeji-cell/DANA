import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { theme } from "@/config/theme";
import { PROFESSIONAL_INTENTS, SENIORITY_LEVELS } from "shared";
import { Ionicons } from "@expo/vector-icons";

export interface BusinessFilters {
  intents: string[];
  seniority: string[];
  industry: string;
}

interface BusinessFilterModalProps {
  onApply: (filters: BusinessFilters) => void;
  onReset: () => void;
}

export const BusinessFilterModal: React.FC<BusinessFilterModalProps> = ({ onApply, onReset }) => {
  const [filters, setFilters] = useState<BusinessFilters>({
    intents: [],
    seniority: [],
    industry: "All",
  });

  const toggleFilter = (key: "intents" | "seniority", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((i) => i !== value)
        : [...prev[key], value],
    }));
  };

  const handleReset = () => {
    setFilters({
      intents: [],
      seniority: [],
      industry: "All",
    });
    onReset();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Professional Filters</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* MARKETPLACE INTENT */}
        <Text style={styles.sectionLabel}>Marketplace Intent</Text>
        <View style={styles.grid}>
          {PROFESSIONAL_INTENTS.map((intent) => (
            <TouchableOpacity
              key={intent}
              onPress={() => toggleFilter("intents", intent)}
              style={[styles.chip, filters.intents.includes(intent) && styles.activeChip]}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.intents.includes(intent) && styles.activeChipText,
                ]}
              >
                {intent.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SENIORITY LEVEL */}
        <Text style={styles.sectionLabel}>Minimum Seniority</Text>
        <View style={styles.grid}>
          {SENIORITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => toggleFilter("seniority", level)}
              style={[styles.chip, filters.seniority.includes(level) && styles.activeChip]}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.seniority.includes(level) && styles.activeChipText,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.applyBtn}
        onPress={() => onApply(filters)}
        activeOpacity={0.8}
      >
        <Text style={styles.applyBtnText}>Show Results</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.lg,
    height: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    color: theme.colors.foreground,
    fontSize: 18,
    fontWeight: "800",
  },
  resetText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  sectionLabel: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.input,
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.muted,
    fontSize: 13,
    textTransform: "capitalize",
  },
  activeChipText: {
    color: theme.colors.primaryForeground,
    fontWeight: "700",
  },
  applyBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  applyBtnText: {
    color: theme.colors.primaryForeground,
    fontWeight: "800",
    fontSize: 16,
  },
});
