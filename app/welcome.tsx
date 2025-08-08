// Import navigation hook from Expo Router
import { useRouter } from "expo-router";

// Import React Native core components and utilities
import {
  Dimensions, // Used to get screen width/height for responsive layouts
  SafeAreaView, // Ensures content is within safe screen area (avoids notches)
  StyleSheet, // For defining component styles
  Text, // Text display component
  TouchableOpacity, // Pressable component for buttons
  View, // Container component for layout
} from "react-native";

// Destructure width and height for potential use in responsive designs
const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter(); // Initialize router for navigation

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main content section with logo and tagline */}
        <View style={styles.mainContent}>
          {/* Branding section */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>
              FitMind
              <Text style={styles.brandAccent}>AI</Text>
            </Text>
          </View>

          {/* Tagline lines */}
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Think sharp.</Text>
            <Text style={styles.tagline}>Feel strong.</Text>
            <Text style={styles.tagline}>Be unshakable</Text>
          </View>
        </View>

        {/* Button to navigate to onboarding screen */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push("/onboarding")} // Navigate to onboarding screen
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Style definitions for the screen
const styles = StyleSheet.create({
  container: {
    flex: 1, // Fill entire screen height
    backgroundColor: "#efdff1", // Light purple background for soft welcome look
  },
  content: {
    flex: 1, // Fill remaining space inside SafeAreaView
    paddingHorizontal: 30, // Add horizontal padding on both sides
    justifyContent: "space-between", // Space content vertically with space between
  },
  mainContent: {
    flex: 1, // Take up most of the screen space
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
  brandContainer: {
    marginBottom: 60, // Space between logo and tagline
  },
  brandName: {
    fontSize: 48, // Large title size
    fontWeight: "bold", // Bold text for brand emphasis
    color: "#333", // Dark gray text color
    textAlign: "center", // Center the brand text
  },
  brandAccent: {
    color: "#4A90E2", // Blue color accent for the 'AI' part
  },
  taglineContainer: {
    alignItems: "center", // Center all tagline text
  },
  tagline: {
    fontSize: 18, // Slightly smaller than title
    color: "#666", // Medium gray for soft contrast
    marginBottom: 8, // Space between each tagline line
    textAlign: "center", // Center the text
  },
  buttonContainer: {
    paddingBottom: 50, // Space from the bottom of the screen
  },
  getStartedButton: {
    backgroundColor: "#9512af", // Purple background for CTA
    borderRadius: 25, // Rounded button
    height: 56, // Button height
    alignItems: "center", // Center text horizontally
    justifyContent: "center", // Center text vertically
    shadowColor: "#9512af", // Purple shadow color
    shadowOffset: { width: 0, height: 4 }, // Shadow offset for elevation
    shadowOpacity: 0.3, // Shadow visibility
    shadowRadius: 8, // Shadow blur radius
    elevation: 5, // Android shadow effect
  },
  getStartedText: {
    color: "white", // White text for contrast
    fontSize: 16, // Medium size
    fontWeight: "600", // Semi-bold for better emphasis
  },
});
