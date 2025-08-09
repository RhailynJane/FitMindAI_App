import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#9512af",
        tabBarInactiveTintColor: "#999",
        tabBarShowLabel: false,

        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          height: Platform.OS === "ios" ? 80 : 100,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },

        tabBarIcon: ({ color, size, focused }) => (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
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

      <Tabs.Screen
        name="workout"
        options={{
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

      <Tabs.Screen
        name="workout-plans"
        options={{
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

      <Tabs.Screen
        name="challenges"
        options={{
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

      <Tabs.Screen
        name="profile"
        options={{
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
