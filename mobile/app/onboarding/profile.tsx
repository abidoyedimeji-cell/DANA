import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { updateProfile, profileUpdateSchema } from "shared";
import { theme } from "@/config/theme";

export default function OnboardingProfileScreen() {
  const { user, profile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name ?? profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio_social ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    setError(null);
    const parsed = profileUpdateSchema.safeParse({
      firstName: firstName.trim() || undefined,
      bio_social: bio.trim() || undefined,
      location: location.trim() || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      if (user?.id && (parsed.data.firstName ?? parsed.data.bio_social ?? parsed.data.location)) {
        await updateProfile(supabase, user.id, {
          firstName: parsed.data.firstName,
          bio_social: parsed.data.bio_social,
          location: parsed.data.location,
        });
      }
      router.replace("/onboarding/verify");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.subtitle}>Add a few details. You can change them later.</Text>

          <Text style={styles.label}>Display name / First name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={theme.colors.muted}
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading}
          />
          <Text style={styles.label}>Bio (optional)</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="A short bio"
            placeholderTextColor={theme.colors.muted}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            editable={!loading}
          />
          <Text style={styles.label}>Location (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="City or area"
            placeholderTextColor={theme.colors.muted}
            value={location}
            onChangeText={setLocation}
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  scroll: { paddingBottom: theme.spacing.xl },
  title: { fontSize: 24, fontWeight: "600", color: theme.colors.foreground, marginBottom: 8 },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginBottom: 24 },
  label: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.foreground,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bioInput: { minHeight: 80, textAlignVertical: "top" },
  error: { color: theme.colors.destructive, fontSize: 14, marginTop: theme.spacing.sm },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: theme.colors.primaryForeground, fontSize: 16, fontWeight: "600" },
});
