import { Ionicons } from "@expo/vector-icons"; // Icon set from Expo for UI feedback
import { useEffect, useState } from "react"; // React hooks for lifecycle and state
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Core React Native components

// Props interface for passing a callback when API status changes
interface ApiStatusCheckerProps {
  onStatusChange: (isOnline: boolean) => void;
}

// Main component definition
export default function ApiStatusChecker({
  onStatusChange,
}: ApiStatusCheckerProps) {
  // State: Whether the API is online or not
  const [isOnline, setIsOnline] = useState(false);
  // State: Whether we're currently checking the API status
  const [isChecking, setIsChecking] = useState(true);
  // State: Error message if API is down or request fails
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // useEffect to run once on component mount
  useEffect(() => {
    checkApiStatus(); // Check API status immediately on load
  }, []);

  // Function to check the status of the ExerciseDB API
  const checkApiStatus = async () => {
    try {
      setIsChecking(true); // Start checking
      setErrorMessage(null); // Reset any previous errors

      // Make a simple GET request to the ExerciseDB endpoint
      const response = await fetch(
        "https://exercisedb.p.rapidapi.com/exercises/bodyPartList",
        {
          headers: {
            "X-RapidAPI-Key":
              process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY || "test", // Use env var or fallback
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
          },
        }
      );

      // If the response is OK (status code 200–299)
      if (response.ok) {
        setIsOnline(true); // Set status to online
        onStatusChange(true); // Inform parent component
        setErrorMessage(null); // No error
      } else {
        // API responded but with an error
        setIsOnline(false);
        onStatusChange(false);

        // Handle specific HTTP errors
        if (response.status === 403) {
          setErrorMessage("API key invalid or missing");
        } else if (response.status === 429) {
          setErrorMessage("Rate limit exceeded");
        } else {
          setErrorMessage(`API error: ${response.status}`);
        }
      }
    } catch (error) {
      // Network or unexpected error
      console.log("API check failed:", error);
      setIsOnline(false);
      onStatusChange(false);
      setErrorMessage("Connection failed");
    } finally {
      setIsChecking(false); // Done checking
    }
  };

  // While checking, show a loading indicator
  if (isChecking) {
    return (
      <View style={styles.container}>
        <Text style={styles.checkingText}>Checking API status...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        isOnline ? styles.online : styles.offline, // Change background based on status
      ]}
    >
      <Ionicons
        name={isOnline ? "checkmark-circle" : "alert-circle"} // Icon based on status
        size={16}
        color={isOnline ? "#4CAF50" : "#ff4444"} // Green if online, red if offline
      />
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.statusText,
            isOnline ? styles.onlineText : styles.offlineText, // Text color based on status
          ]}
        >
          ExerciseDB API: {isOnline ? "Online" : "Offline"}
        </Text>
        {/* Show error message if available */}
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>

      {/* Retry button only if offline */}
      {!isOnline && (
        <TouchableOpacity onPress={checkApiStatus} style={styles.retryButton}>
          <Ionicons name="refresh" size={14} color="#ff4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Horizontal layout
    alignItems: "center", // Vertically center items
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  online: {
    backgroundColor: "#E8F5E8", // Light green background when online
  },
  offline: {
    backgroundColor: "#FFEBEE", // Light red background when offline
  },
  textContainer: {
    flex: 1, // Take up remaining space
    marginLeft: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  onlineText: {
    color: "#4CAF50", // Green text for online
  },
  offlineText: {
    color: "#ff4444", // Red text for offline
  },
  errorText: {
    fontSize: 10,
    color: "#ff4444",
    marginTop: 2,
  },
  checkingText: {
    fontSize: 12,
    color: "#666", // Grey text while checking
  },
  retryButton: {
    padding: 4, // Small padding for icon touchable
  },
});
