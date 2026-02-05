import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { theme } from "@/config/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  placeholderTextColor = theme.colors.muted,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
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
  inputError: {
    borderColor: theme.colors.destructive,
  },
  error: {
    fontSize: 12,
    color: theme.colors.destructive,
    marginTop: theme.spacing.xs,
  },
});
