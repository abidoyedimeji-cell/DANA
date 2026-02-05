import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AppContextMode = "social" | "business";

interface ContextModeType {
  mode: AppContextMode;
  toggleMode: () => void;
}

const ContextMode = createContext<ContextModeType | undefined>(undefined);

export const ContextModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppContextMode>("social");

  // Load saved preference on boot
  useEffect(() => {
    AsyncStorage.getItem("dana_app_mode").then((saved) => {
      if (saved && (saved === "social" || saved === "business")) {
        setMode(saved as AppContextMode);
      }
    });
  }, []);

  // Memoize toggleMode to prevent unnecessary re-renders
  const toggleMode = useCallback(async () => {
    const newMode = mode === "social" ? "business" : "social";
    setMode(newMode);
    await AsyncStorage.setItem("dana_app_mode", newMode);
  }, [mode]);

  // useMemo ensures the 'value' reference stays the same unless 'mode' or 'toggleMode' changes
  // This prevents all consumers from re-rendering when unrelated state changes
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return <ContextMode.Provider value={value}>{children}</ContextMode.Provider>;
};

export const useAppContextMode = () => {
  const context = useContext(ContextMode);
  if (!context) throw new Error("useAppContextMode must be used within ContextModeProvider");
  return context;
};
