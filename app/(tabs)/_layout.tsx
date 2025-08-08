// Importing Ionicons from Expo's icon set
import { Ionicons } from "@expo/vector-icons";

// Importing Tabs from Expo Router for navigation
import { Tabs } from "expo-router";

// Platform helps determine if the user is on iOS or Android
import { Platform, View } from "react-native";

// The main component for defining bottom tab navigation
export default function TabLayout() {
  return (
    <Tabs
      // Shared options for all tab screens
      screenOptions={{
        headerShown: false, // Hide the top header bar
        tabBarActiveTintColor: "#9512af", // Active tab icon color
        tabBarInactiveTintColor: "#999", // Inactive tab icon color
        tabBarShowLabel: false, // Hides labels under icons

        // Custom styling for the tab bar
        tabBarStyle: {
          backgroundColor: "white", // White background
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0", // Light border on top of tab bar
          height: Platform.OS === "ios" ? 80 : 100, // Taller on Android
          paddingBottom: Platform.OS === "ios" ? 20 : 8, // Bottom padding varies by platform
          paddingTop: 8,
          position: "absolute", // Keep tab bar fixed at bottom
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8, // Android shadow
          shadowColor: "#000", // iOS shadow color
          shadowOffset: { width: 0, height: -2 }, // iOS shadow offset
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }}
    >
      {/* Dashboard/Home Tab */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="home" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Workout Tab */}
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="fitness" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Workout Plans Tab */}
      <Tabs.Screen
        name="workout-plans"
        options={{
          title: "Plans",
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="calendar" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Challenges Tab */}
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="trophy" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="person" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
