// Import Ionicons for displaying icon elements
import { Ionicons } from "@expo/vector-icons";

// Import core React Native components
import { StyleSheet, Text, View } from "react-native";

// Import SafeAreaView to avoid UI overlapping with notches or status bars
import { SafeAreaView } from "react-native-safe-area-context";

// Define props for the OfflineMessage component
interface OfflineMessageProps {
  message?: string; // Optional message to show under the title
  title?: string; // Optional title for the offline screen
}

// Define and export the OfflineMessage component
export default function OfflineMessage({
  message = "We're currently working to restore the service. Please try again later.", // Default message
  title = "Service Temporarily Unavailable", // Default title
}: OfflineMessageProps) {
  return (
    // Safe area to ensure content is rendered within device-safe boundaries
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Icon indicating offline status */}
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color="#666" />
        </View>

        {/* Display the offline title */}
        <Text style={styles.title}>{title}</Text>

        {/* Display the offline message */}
        <Text style={styles.message}>{message}</Text>

        {/* Additional status note with a construction icon */}
        <View style={styles.statusContainer}>
          <Ionicons name="construct-outline" size={16} color="#007AFF" />
          <Text style={styles.statusText}>Our team is working on this</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Define styles for the OfflineMessage UI
const styles = StyleSheet.create({
  // Style for the SafeAreaView to fill screen and set background color
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Light background
  },

  // Container to center content both vertically and horizontally
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  // Icon wrapper with spacing from the rest of the content
  iconContainer: {
    marginBottom: 24,
  },

  // Style for the title text
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },

  // Style for the body message text
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },

  // Style for the "working on it" status message
  statusContainer: {
    flexDirection: "row", // Lay icon and text side-by-side
    alignItems: "center", // Vertically align icon and text
    backgroundColor: "#e3f2fd", // Light blue background
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  // Style for the status message text
  statusText: {
    fontSize: 14,
    color: "#007AFF", // iOS-style blue
    marginLeft: 6, // Space between icon and text
    fontWeight: "500",
  },
});
