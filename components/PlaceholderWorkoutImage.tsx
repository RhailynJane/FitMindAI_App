// Import Ionicons from Expo vector icons for the fitness icon
import { Ionicons } from "@expo/vector-icons";

// Import React Native components for UI rendering
import { StyleSheet, Text, View } from "react-native";

// Define the props that the PlaceholderWorkoutImage component will accept
interface PlaceholderWorkoutImageProps {
  exerciseName: string; // Name of the exercise to display
  size?: number; // Optional size of the placeholder box (width & height), defaults to 300
}

// Define and export the PlaceholderWorkoutImage functional component
export default function PlaceholderWorkoutImage({
  exerciseName, // Destructure the exercise name to show below the icon
  size = 300, // Default size to 300 if not provided
}: PlaceholderWorkoutImageProps) {
  return (
    // Outer container view with customizable size and styled appearance
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Display a fitness icon, scaled relative to the container size */}
      <Ionicons name="fitness-outline" size={size / 4} color="#9512af" />

      {/* Display the exercise name below the icon */}
      <Text style={styles.text}>{exerciseName}</Text>
    </View>
  );
}

// Define styles used by the component
const styles = StyleSheet.create({
  // Style for the main container
  container: {
    backgroundColor: "#f3e8f5", // Light purple background as a visual placeholder
    borderRadius: 12, // Rounded corners
    justifyContent: "center", // Vertically center content
    alignItems: "center", // Horizontally center content
    padding: 20, // Inner spacing
  },
  // Style for the text below the icon
  text: {
    marginTop: 16, // Space above the text (below the icon)
    fontSize: 16, // Medium font size
    fontWeight: "600", // Semi-bold for emphasis
    color: "#9512af", // Themed purple color
    textAlign: "center", // Center-align the text
  },
});
