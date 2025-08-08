// Import React to provide types such as JSX
import React from "react";
// Import the Stack navigator from expo-router to manage app navigation stack
import { Stack } from "expo-router";

// Import Expo's StatusBar component to customize the status bar appearance
import { StatusBar } from "expo-status-bar";

// Import SafeAreaProvider to ensure UI components respect safe areas (e.g. notch, status bar)
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import custom authentication context provider to manage user auth state
import { AuthProvider } from "../hooks/useAuth";

/**
 * Main component that defines the root layout of the entire application
 *
 * This component sets up:
 * - Safe area handling for different device types
 * - Authentication context for the entire app
 * - Global status bar styling
 * - Navigation stack with all app screens
 *
 * The Stack navigator manages screen transitions and navigation state
 * between different parts of the application.
 */
export default function RootLayout() {
  return (
    // Wrap the app in SafeAreaProvider to avoid overlap with system UI areas
    <SafeAreaProvider>
      {/* Provide authentication context to the entire app */}
      <AuthProvider>
        {/* Customize status bar appearance */}
        <StatusBar style="dark" />

        {/* Define a stack navigator to manage screen transitions */}
        <Stack
          screenOptions={{
            headerShown: false, // Hide default headers for all screens
            contentStyle: { backgroundColor: "#f8f9fa" }, // Set default background color
          }}
        >
          {/* Auth and Onboarding Screens */}
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="onboarding-temp" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="profile-setup" />
          <Stack.Screen name="goal-selection" />
          <Stack.Screen name="welcome-success" />

          {/* Main App Screens */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="ai-chat" />

          {/* Exercise Related Screens */}
          <Stack.Screen name="exercises/[bodyPart]" />
          <Stack.Screen name="exercise-details/[id]" />

          {/* Workout Related Screens */}
          <Stack.Screen name="workout/[workoutId]" />
          <Stack.Screen name="workout-complete" />
          <Stack.Screen name="workout-session/[sessionId]" />

          {/* System Screens */}
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="_sitemap" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
