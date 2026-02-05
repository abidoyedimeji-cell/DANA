import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  FlatList,
} from "react-native";
import { Link, Redirect, router } from "expo-router";
import { useAuth } from "@/components/providers/AuthProvider";
import { theme } from "@/config/theme";
import { signupSchema, COUNTRY_DIAL_CODES, toE164 } from "shared";
import type { z } from "zod";

type SignupForm = z.infer<typeof signupSchema>;

const GENDERS: SignupForm["gender"][] = ["male", "female", "non-binary", "prefer-not-to-say"];

type FormState = Omit<SignupForm, "phone"> & { countryCode: string; phoneNational: string };

export default function SignupScreen() {
  const { user, profile, isLoading, signUp } = useAuth();

  const isProfileComplete = !!profile?.is_profile_complete;
  if (!isLoading && user && profile && isProfileComplete) {
    return <Redirect href="/(tabs)" />;
  }
  if (!isLoading && user && profile && !isProfileComplete) {
    return <Redirect href="/profile-building" />;
  }
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    username: "",
    firstName: "",
    lastName: "",
    countryCode: "+44",
    phoneNational: "",
    gender: "prefer-not-to-say",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  const handleSignup = async () => {
    setError("");
    const fullPhone = toE164(form.countryCode, form.phoneNational);
    const parsed = signupSchema.safeParse({ ...form, phone: fullPhone });
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      setError(first?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      await signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        username: parsed.data.username,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        gender: parsed.data.gender,
      });
      Alert.alert(
        "Check your email",
        "We sent a confirmation link. Open it to finish signing up, then sign in here.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Sign up failed";
      setError(message);
      Alert.alert("Sign up failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>DANA – Connect, Meet, Thrive</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.muted}
            value={form.email}
            onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.muted}
            value={form.password}
            onChangeText={(t) => setForm((f) => ({ ...f, password: t }))}
            secureTextEntry
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={theme.colors.muted}
            value={form.username}
            onChangeText={(t) => setForm((f) => ({ ...f, username: t }))}
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor={theme.colors.muted}
            value={form.firstName}
            onChangeText={(t) => setForm((f) => ({ ...f, firstName: t }))}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Last name (optional)"
            placeholderTextColor={theme.colors.muted}
            value={form.lastName ?? ""}
            onChangeText={(t) => setForm((f) => ({ ...f, lastName: t || undefined }))}
            editable={!loading}
          />
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={styles.countryCodeButton}
              onPress={() => setCountryPickerOpen((o) => !o)}
              disabled={loading}
            >
              <Text style={styles.countryCodeText}>{form.countryCode}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="7911 123456"
              placeholderTextColor={theme.colors.muted}
              value={form.phoneNational}
              onChangeText={(t) => setForm((f) => ({ ...f, phoneNational: t }))}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
          {countryPickerOpen ? (
            <View style={styles.countryList}>
              <FlatList
                data={COUNTRY_DIAL_CODES}
                keyExtractor={(item) => item.dialCode}
                renderItem={({ item: { dialCode, label } }) => (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => {
                      setForm((f) => ({ ...f, countryCode: dialCode }));
                      setCountryPickerOpen(false);
                    }}
                  >
                    <Text style={styles.countryItemText}>{label}</Text>
                  </TouchableOpacity>
                )}
                style={styles.countryListInner}
              />
            </View>
          ) : null}
          <Text style={styles.hint}>Select country code, then enter number without leading zero</Text>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderChip, form.gender === g && styles.genderChipActive]}
                onPress={() => setForm((f) => ({ ...f, gender: g }))}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.genderChipText,
                    form.gender === g && styles.genderChipTextActive,
                  ]}
                >
                  {g === "prefer-not-to-say" ? "Prefer not to say" : g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating account…" : "Sign up"}
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.link}>
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
    paddingVertical: theme.spacing.xl * 2,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.foreground,
    fontSize: 16,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing.lg,
  },
  phoneRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  countryCodeButton: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    minWidth: 80,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  countryCodeText: {
    fontSize: 16,
    color: theme.colors.foreground,
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  countryList: {
    maxHeight: 160,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  countryListInner: {
    flexGrow: 0,
  },
  countryItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  countryItemText: {
    fontSize: 14,
    color: theme.colors.foreground,
  },
  genderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  genderChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  genderChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderChipText: {
    fontSize: 14,
    color: theme.colors.foreground,
  },
  genderChipTextActive: {
    color: theme.colors.primaryForeground,
    fontWeight: "600",
  },
  error: {
    color: theme.colors.destructive,
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: theme.spacing.lg,
    alignItems: "center",
  },
  linkText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
});
