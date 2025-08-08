// Import navigation hook from Expo Router
import { useRouter } from "expo-router";

// Import necessary React Native components and APIs
import {
  Dimensions, // To get device dimensions for responsive styling
  Image, // For displaying the image
  SafeAreaView, // Ensures UI doesn't overlap system UI (like notch/status bar)
  StyleSheet, // For styling components
  Text, // For rendering text
  TouchableOpacity, // For pressable button
  View, // Basic container component
} from "react-native";

// Import custom authentication hook to get current user
import { useAuth } from "../hooks/useAuth";

// Get screen width to calculate responsive image sizing
const { width } = Dimensions.get("window");

export default function WelcomeSuccess() {
  const { user } = useAuth(); // Get authenticated user info
  const router = useRouter(); // Initialize navigation handler

  // Function to extract and return first name of the user
  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName.split(" ")[0]; // Get first word of displayName
    }
    return "User"; // Fallback name if no displayName exists
  };

  // Handler for "Go to Home" button — navigates to dashboard tab
  const handleGoToHome = () => {
    router.replace("/(tabs)/dashboard"); // Replaces current screen with dashboard
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero illustration */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "/placeholder.svg?height=300&width=300" }} // Placeholder image URI
            style={styles.heroImage}
            resizeMode="contain" // Maintain aspect ratio
          />
        </View>

        {/* Text section */}
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome, {getUserName()}!</Text>{" "}
          {/* Personalized welcome */}
          <Text style={styles.subtitle}>
            You are all set now, lets reach your goals together with us
          </Text>
        </View>

        {/* Navigation button */}
        <TouchableOpacity style={styles.homeButton} onPress={handleGoToHome}>
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles for this screen
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up full screen height
    backgroundColor: "#efdff1", // Soft purple background
  },
  content: {
    flex: 1, // Fill space within SafeAreaView
    paddingHorizontal: 30, // Horizontal padding
    paddingTop: 60, // Top padding for spacing
    alignItems: "center", // Center all children horizontally
    justifyContent: "space-between", // Distribute children vertically with space
  },
  imageContainer: {
    flex: 1, // Take remaining space
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
  },
  heroImage: {
    width: width * 0.8, // 80% of screen width
    height: width * 0.8, // Keep image square
  },
  textContainer: {
    alignItems: "center", // Center text horizontally
    marginBottom: 60, // Space from bottom
  },
  welcomeText: {
    fontSize: 24, // Large text
    fontWeight: "bold", // Bold style
    color: "#333", // Dark gray
    marginBottom: 16, // Space below text
    textAlign: "center", // Centered text
  },
  subtitle: {
    fontSize: 16, // Regular text
    color: "#666", // Light gray
    textAlign: "center", // Centered text
    lineHeight: 22, // Comfortable line spacing
    paddingHorizontal: 20, // Horizontal padding within text block
  },
  homeButton: {
    backgroundColor: "#9512af", // Purple background
    borderRadius: 25, // Rounded corners
    height: 60, // Fixed height
    width: "100%", // Full width of parent
    alignItems: "center", // Center text horizontally
    justifyContent: "center", // Center text vertically
    marginBottom: 40, // Space from bottom
    shadowColor: "#9512af", // Purple shadow
    shadowOffset: { width: 0, height: 4 }, // Shadow direction
    shadowOpacity: 0.3, // Shadow transparency
    shadowRadius: 8, // Shadow blur
    elevation: 5, // Shadow for Android
  },
  homeButtonText: {
    color: "white", // White text color
    fontSize: 16, // Medium size
    fontWeight: "600", // Semi-bold
  },
});
