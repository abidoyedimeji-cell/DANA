import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="mode" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="walkthrough" />
    </Stack>
  );
}
