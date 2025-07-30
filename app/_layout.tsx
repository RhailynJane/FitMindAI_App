import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: "#efdff1" }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
          <Stack.Screen
            name="goal-selection"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen
            name="welcome-success"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="exercises/[bodyPart]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="exercise-details/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="workout/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="workout-complete"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="ai-chat" options={{ headerShown: false }} />
        </Stack>
      </View>
    </>
  );
}
