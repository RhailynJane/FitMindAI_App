import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "../components/ErrorBoundary";
import { AuthProvider } from "../hooks/useAuth";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <ErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#f8f9fa" },
            }}
          >
            {/* Auth Screens */}
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="signin" />
            <Stack.Screen name="profile-setup" />
            <Stack.Screen name="goal-selection" />
            <Stack.Screen name="welcome-success" />

            {/* Main App Screens */}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="ai-chat" />

            {/* Exercise Screens */}
            <Stack.Screen name="exercises/[bodyPart]" />
            <Stack.Screen name="exercise-details/[id]" />

            {/* Workout Screens */}
            <Stack.Screen name="workout/[workoutId]" />
            <Stack.Screen name="workout-complete" />
          </Stack>
        </ErrorBoundary>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
