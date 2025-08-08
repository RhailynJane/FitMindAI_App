// Import the Stack navigator from expo-router to manage app navigation stack
import { Stack } from "expo-router";

// Import Expo's StatusBar component to customize the status bar appearance
import { StatusBar } from "expo-status-bar";

// Import SafeAreaProvider to ensure UI components respect safe areas (e.g. notch, status bar)
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import custom authentication context provider to manage user auth state
import { AuthProvider } from "../hooks/useAuth";

// Main component that defines the root layout of the app
export default function RootLayout() {
  return (
    // Wrap the app in SafeAreaProvider to avoid overlap with system UI areas
    <SafeAreaProvider>
      {/* Provide authentication context to the entire app */}
      <AuthProvider>
        {/* Customize status bar appearance */}
        <StatusBar style="dark" backgroundColor="#ffffff" />

        {/* Define a stack navigator to manage screen transitions */}
        <Stack
          screenOptions={{
            headerShown: false, // Hide default headers for all screens
            contentStyle: { backgroundColor: "#f8f9fa" }, // Set default background color
          }}
        >
          {/* Define each screen in the navigation stack by its route name */}
          <Stack.Screen name="index" /> {/* Main entry screen */}
          <Stack.Screen name="welcome" /> {/* Welcome screen */}
          <Stack.Screen name="onboarding" /> {/* Onboarding flow */}
          <Stack.Screen name="signup" /> {/* Sign up screen */}
          <Stack.Screen name="profile-setup" /> {/* User profile setup */}
          <Stack.Screen name="goal-selection" /> {/* Goal selection step */}
          <Stack.Screen name="signin" /> {/* Sign in screen */}
          <Stack.Screen name="welcome-success" />{" "}
          {/* Success screen after onboarding */}
          <Stack.Screen name="(tabs)" /> {/* Main tab navigator */}
          <Stack.Screen name="exercises/[bodyPartName]" />{" "}
          {/* Dynamic route for exercises by body part */}
          <Stack.Screen name="exercise-details/[exerciseId]" />{" "}
          {/* Detailed view of a specific exercise */}
          <Stack.Screen name="workout/[workoutId]" />{" "}
          {/* View a specific workout */}
          <Stack.Screen name="workout-complete" />{" "}
          {/* Confirmation after completing a workout */}
          <Stack.Screen name="workout-session/[sessionId]" />{" "}
          {/* Ongoing workout session */}
          <Stack.Screen name="ai-chat" /> {/* AI-powered chat assistant */}
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
