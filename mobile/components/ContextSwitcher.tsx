import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAppContextMode } from "./providers/ContextModeProvider";
import { theme } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";

export const ContextSwitcher = () => {
  const { mode, toggleMode } = useAppContextMode();

  return (
    <TouchableOpacity style={styles.container} onPress={toggleMode} activeOpacity={0.7}>
      <Ionicons
        name={mode === "social" ? "people" : "briefcase"}
        size={18}
        color={theme.colors.primary}
      />
      <Text style={styles.text}>{mode === "social" ? "Social" : "Business"}</Text>
      <Ionicons name="swap-horizontal" size={14} color={theme.colors.muted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  text: {
    color: theme.colors.foreground,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
