import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ContextModeProvider } from "@/components/providers/ContextModeProvider";
import { GlobalErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { logger } from "shared";

function RootNavigator() {
  const { user, profile, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || !user || !profile) return;

    if (!profile.is_profile_complete) {
      if (pathname !== "/profile-building") {
        logger.info("Redirecting to Profile Builder", { userId: profile.id });
        router.replace("/profile-building");
      }
      return;
    }

    if (profile.is_profile_complete && pathname === "/profile-building") {
      router.replace("/(tabs)");
    }
  }, [isLoading, user, profile, pathname]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <ContextModeProvider>
          <RootNavigator />
        </ContextModeProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}
