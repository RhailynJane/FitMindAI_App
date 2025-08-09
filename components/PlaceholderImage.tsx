// Import type definitions from React for typing the functional component
import type React from "react";

// Import necessary components and types from React Native
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

// Define props for the PlaceholderImage component
interface PlaceholderImageProps {
  width: number; // Required width of the placeholder image
  height: number; // Required height of the placeholder image
  text?: string; // Optional label/text to display inside the placeholder
  style?: ViewStyle; // Optional custom styles for the outer View
}

// Define and export the PlaceholderImage functional component
export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width, // Destructure width prop
  height, // Destructure height prop
  text = "Image", // Default placeholder text if none is provided
  style, // Optional additional styling
}) => {
  return (
    // Container view styled as a placeholder with dynamic width/height
    <View style={[styles.placeholder, { width, height }, style]}>
      {/* Display the placeholder text */}
      <Text style={styles.placeholderText}>{text}</Text>
    </View>
  );
};

// Styles used in the component
const styles = StyleSheet.create({
  // Main container for the placeholder image
  placeholder: {
    backgroundColor: "#f0f0f0", // Light grey background to indicate a placeholder
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    borderRadius: 8, // Rounded corners
    borderWidth: 1, // Thin border around the box
    borderColor: "#ddd", // Light grey border color
    borderStyle: "dashed", // Dashed border to visually suggest a placeholder
  },

  // Style for the placeholder text
  placeholderText: {
    color: "#999", // Grey text color for low emphasis
    fontSize: 12, // Small font size
    fontWeight: "500", // Medium font weight
  },
});
