import type { ReactNode } from "react";
import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import { theme } from "@/config/theme";

type Variant = "primary" | "secondary" | "destructive" | "outline";

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<Variant, { button: ViewStyle; text: TextStyle }> = {
  primary: {
    button: { backgroundColor: theme.colors.primary },
    text: { color: theme.colors.primaryForeground },
  },
  secondary: {
    button: { backgroundColor: theme.colors.secondary },
    text: { color: theme.colors.secondaryForeground },
  },
  destructive: {
    button: { backgroundColor: theme.colors.destructive },
    text: { color: theme.colors.destructiveForeground },
  },
  outline: {
    button: { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.border },
    text: { color: theme.colors.foreground },
  },
};

export function Button({
  children,
  onPress,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
}: ButtonProps) {
  const v = variantStyles[variant];
  return (
    <TouchableOpacity
      style={[styles.base, v.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, v.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
});
