import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../hooks/useAuth";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#f8f9fa" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="profile-setup" />
          <Stack.Screen name="goal-selection" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="welcome-success" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="exercises/[bodyPartName]" />
          <Stack.Screen name="exercise-details/[exerciseId]" />
          <Stack.Screen name="workout/[workoutId]" />
          <Stack.Screen name="workout-complete" />
          <Stack.Screen name="workout-session/[sessionId]" />
          <Stack.Screen name="ai-chat" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
