import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Input } from "@/components/Input";
import { theme } from "@/config/theme";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { PROFESSIONAL_INTENTS, SENIORITY_LEVELS } from "shared";

type FormState = {
  display_name: string;
  bio_social: string;
  headline: string;
  bio_professional: string;
  industry: string;
  years_in_role: string;
  seniority_level: string;
  professional_intents: string[];
  calendar_link_business: string;
  calendar_link_social: string;
};

export default function ProfileBuildingScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState<FormState>({
    display_name: "",
    bio_social: "",
    headline: "",
    bio_professional: "",
    industry: "",
    years_in_role: "0",
    seniority_level: "",
    professional_intents: [],
    calendar_link_business: "",
    calendar_link_social: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      bio_social: profile.bio_social ?? "",
      headline: profile.headline ?? "",
      bio_professional: profile.bio_professional ?? "",
      industry: profile.industry ?? "",
      years_in_role: String(profile.years_in_role ?? 0),
      seniority_level: profile.seniority_level ?? "",
      professional_intents: profile.professional_intents ?? [],
      calendar_link_business: profile.calendar_link_business ?? "",
      calendar_link_social: profile.calendar_link_social ?? "",
    });
  }, [profile]);

  const userId = user?.id;
  const canSubmit = Boolean(form.display_name.trim());

  const updateProfile = async (updates: Record<string, unknown>) => {
    if (!userId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
      if (error) throw error;
      await refreshProfile();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile";
      Alert.alert("Save failed", message);
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = (field: keyof FormState) => {
    const updates: Record<string, unknown> = {};
    if (field === "display_name") updates.display_name = form.display_name.trim() || null;
    if (field === "bio_social") updates.bio_social = form.bio_social.trim() || null;
    if (field === "headline") updates.headline = form.headline.trim() || null;
    if (field === "bio_professional") updates.bio_professional = form.bio_professional.trim() || null;
    if (field === "industry") updates.industry = form.industry.trim() || null;
    if (field === "years_in_role") updates.years_in_role = parseInt(form.years_in_role) || 0;
    if (field === "seniority_level") updates.seniority_level = form.seniority_level || null;
    if (field === "professional_intents") updates.professional_intents = form.professional_intents;
    if (field === "calendar_link_business") updates.calendar_link_business = form.calendar_link_business.trim() || null;
    if (field === "calendar_link_social") updates.calendar_link_social = form.calendar_link_social.trim() || null;
    if (Object.keys(updates).length) updateProfile(updates);
  };

  const toggleIntent = (intent: string) => {
    const newIntents = form.professional_intents.includes(intent)
      ? form.professional_intents.filter((i) => i !== intent)
      : [...form.professional_intents, intent];
    setForm((prev) => ({ ...prev, professional_intents: newIntents }));
    updateProfile({ professional_intents: newIntents });
  };

  const handleComplete = async () => {
    if (!userId) return;
    if (!canSubmit) {
      Alert.alert("Missing info", "Please add at least a display name to continue.");
      return;
    }

    // Soft warning if headline exists but no intents
    if (form.headline && form.professional_intents.length === 0) {
      Alert.alert(
        "Add Marketplace Intents",
        "Tell people what you're looking for to get better matches.",
        [{ text: "Continue Anyway", onPress: () => finishProfile() }, { text: "Go Back", style: "cancel" }]
      );
      return;
    }

    finishProfile();
  };

  const finishProfile = async () => {
    if (!userId) return;
    await updateProfile({
      is_profile_complete: true,
      profile_mode: "both",
      years_in_role: parseInt(form.years_in_role) || 0,
    });
    router.replace("/(tabs)");
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Complete Your Dossier</Text>
        <Text style={styles.subtitle}>Build your unified DANA identity</Text>

        {/* SECTION A: SOCIAL PERSONA */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Social Persona</Text>
          <Input
            label="Display name *"
            value={form.display_name}
            onChangeText={(text) => setForm((prev) => ({ ...prev, display_name: text }))}
            onBlur={() => handleBlur("display_name")}
            editable={!saving}
          />
          <Input
            label="Social Bio"
            value={form.bio_social}
            onChangeText={(text) => setForm((prev) => ({ ...prev, bio_social: text }))}
            onBlur={() => handleBlur("bio_social")}
            editable={!saving}
            multiline
            style={styles.textArea}
            placeholder="What's your vibe?"
          />
        </View>

        {/* SECTION B: PROFESSIONAL PERSONA */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Professional Persona</Text>
          <Input
            label="Headline"
            value={form.headline}
            onChangeText={(text) => setForm((prev) => ({ ...prev, headline: text }))}
            onBlur={() => handleBlur("headline")}
            editable={!saving}
            placeholder="e.g. Seed Investor @ DANA"
          />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Input
                label="Industry"
                value={form.industry}
                onChangeText={(text) => setForm((prev) => ({ ...prev, industry: text }))}
                onBlur={() => handleBlur("industry")}
                editable={!saving}
                containerStyle={styles.rowInput}
              />
            </View>
            <View style={styles.rowRight}>
              <Input
                label="Years"
                value={form.years_in_role}
                onChangeText={(text) => setForm((prev) => ({ ...prev, years_in_role: text }))}
                onBlur={() => handleBlur("years_in_role")}
                editable={!saving}
                keyboardType="numeric"
                containerStyle={styles.rowInput}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Seniority Level</Text>
          <View style={styles.chipRow}>
            {SENIORITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => {
                  setForm((prev) => ({ ...prev, seniority_level: level }));
                  updateProfile({ seniority_level: level });
                }}
                style={[styles.chip, form.seniority_level === level && styles.activeChip]}
              >
                <Text
                  style={[styles.chipText, form.seniority_level === level && styles.activeChipText]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Professional Bio"
            value={form.bio_professional}
            onChangeText={(text) => setForm((prev) => ({ ...prev, bio_professional: text }))}
            onBlur={() => handleBlur("bio_professional")}
            editable={!saving}
            multiline
            style={styles.textArea}
          />

          <Text style={styles.fieldLabel}>Marketplace Intents</Text>
          <Text style={styles.hint}>Select what you're looking for or offering</Text>
          <View style={styles.intentGrid}>
            {PROFESSIONAL_INTENTS.map((intent) => (
              <TouchableOpacity
                key={intent}
                onPress={() => toggleIntent(intent)}
                style={[
                  styles.chip,
                  form.professional_intents.includes(intent) && styles.activeChip,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    form.professional_intents.includes(intent) && styles.activeChipText,
                  ]}
                >
                  {intent.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION C: AVAILABILITY ENGINES */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Availability & Calendar</Text>
          <Text style={styles.hint}>
            Link your external calendar to show real-time availability. Leave blank to use manual time proposals.
          </Text>

          <Input
            label="Business Meeting Link (Optional)"
            value={form.calendar_link_business}
            onChangeText={(text) => setForm((prev) => ({ ...prev, calendar_link_business: text }))}
            onBlur={() => handleBlur("calendar_link_business")}
            editable={!saving}
            placeholder="https://cal.com/yourname/business"
            keyboardType="url"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Used for Mentorship, Investing, and Networking requests. Supports Cal.com, Calendly, or iCal links.
          </Text>

          <Input
            label="Social Meeting Link (Optional)"
            value={form.calendar_link_social}
            onChangeText={(text) => setForm((prev) => ({ ...prev, calendar_link_social: text }))}
            onBlur={() => handleBlur("calendar_link_social")}
            editable={!saving}
            placeholder="https://cal.com/yourname/social"
            keyboardType="url"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Used for Social meets and Dating requests.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
          onPress={handleComplete}
          disabled={!canSubmit || saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? "Saving..." : "Finish & Unlock DANA Social"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    letterSpacing: 2,
    marginBottom: theme.spacing.md,
    textTransform: "uppercase",
  },
  fieldLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
    fontStyle: "italic",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  rowLeft: {
    flex: 2,
  },
  rowRight: {
    flex: 1,
  },
  rowInput: {
    marginBottom: 0,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  intentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "transparent",
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: "capitalize",
  },
  activeChipText: {
    color: theme.colors.primaryForeground,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: theme.spacing.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
});
