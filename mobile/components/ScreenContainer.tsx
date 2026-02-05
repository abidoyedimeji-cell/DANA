import type { ReactNode } from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { theme } from "@/config/theme";

interface ScreenContainerProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function ScreenContainer({ children, style }: ScreenContainerProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
});
