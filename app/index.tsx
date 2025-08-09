import { useRouter } from "expo-router"; // Hook from Expo Router for navigation
import { useEffect } from "react"; // React hook to handle side effects like redirection
import { ActivityIndicator, StyleSheet, View } from "react-native"; // Core React Native components for layout and loading UI
import { useAuth } from "../hooks/useAuth"; // Custom hook to access auth state (user + loading status)

export default function Index() {
  const { user, loading } = useAuth(); // Destructure `user` and `loading` from the auth context
  const router = useRouter(); // Initialize router for programmatic navigation

  useEffect(() => {
    // Run this effect when `user`, `loading`, or `router` changes
    if (!loading) {
      // Wait for loading to complete before redirecting
      if (user) {
        console.log("User authenticated, redirecting to dashboard"); // Debug log
        router.replace("/(tabs)/dashboard"); // Redirect authenticated user to dashboard
      } else {
        console.log("No user found, redirecting to welcome"); // Debug log
        router.replace("/welcome"); // Redirect unauthenticated user to welcome screen
      }
    }
  }, [user, loading, router]); // Dependencies for useEffect

  if (loading) {
    // Show loading spinner while auth status is being determined
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9512af" />
      </View>
    );
  }

  return null; // Render nothing once redirect happens
}

// Styles for the loading container
const styles = StyleSheet.create({
  container: {
    flex: 1, // Full height
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    backgroundColor: "#efdff1", // Light background color
  },
});
