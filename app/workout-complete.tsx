"use client"; // Ensures the component is rendered client-side (relevant in SSR setups)

// Icon pack from Expo
import { Ionicons } from "@expo/vector-icons";

// Navigation + route param hooks from Expo Router
import { useLocalSearchParams, useRouter } from "expo-router";

// React utilities
import { useEffect, useState } from "react";

// React Native components
import {
  SafeAreaView, // Ensures content doesn't go into notches/status bar
  StyleSheet, // Used for defining styles
  Text, // Text display component
  TouchableOpacity, // Pressable component
  View, // Layout component
} from "react-native";

// Custom auth hook to get current user
import { useAuth } from "../hooks/useAuth";

// Firestore service for interacting with workout session data
import { firestoreService } from "../services/firestoreService";

// Define the expected shape of workout stats
interface WorkoutStats {
  duration: number; // Duration in minutes
  calories: number; // Calories burned
  exercises: number; // Number of exercises completed
}

// Main component for the workout completion screen
export default function WorkoutCompleteScreen() {
  const router = useRouter(); // Navigation handler
  const { user } = useAuth(); // Get the current logged-in user
  const params = useLocalSearchParams(); // Access route params from URL

  // Local state to store workout stats
  const [stats, setStats] = useState<WorkoutStats>({
    duration: 15, // Default 15 minutes
    calories: 150, // Default 150 calories
    exercises: 4, // Default 4 exercises
  });

  useEffect(() => {
    // If params have data, use them to set the stats
    if (params.duration) {
      setStats({
        duration: Number.parseInt(params.duration as string) || 15,
        calories: Number.parseInt(params.calories as string) || 150,
        exercises: Number.parseInt(params.exercises as string) || 4,
      });
    }

    // If sessionId exists and user is logged in, complete the session in Firestore
    if (params.sessionId && user) {
      completeWorkoutSession();
    }
  }, [params, user]);

  // Function to mark workout session as completed in Firestore
  const completeWorkoutSession = async () => {
    try {
      if (params.sessionId) {
        console.log("Completing workout session:", params.sessionId);
        await firestoreService.completeWorkoutSession(
          params.sessionId as string,
          stats.duration
        );
        console.log("Workout session completed successfully");
      }
    } catch (error) {
      console.error("Error completing workout session:", error);
    }
  };

  // Format duration from decimal minutes to mm:ss format
  const formatDuration = (minutes: number) => {
    const mins = Math.floor(minutes); // Get whole minutes
    const secs = Math.floor((minutes - mins) * 60); // Get remaining seconds
    return `${mins}:${secs.toString().padStart(2, "0")}`; // Pad seconds with 0 if needed
  };

  return (
    <SafeAreaView style={styles.container}>
      {" "}
      {/* Outer container */}
      <View style={styles.content}>
        {" "}
        {/* Main inner content */}
        {/* Header with close (X) button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/dashboard")}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        {/* Completion confirmation section */}
        <View style={styles.completedContainer}>
          <View style={styles.completedIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#9512af" />
          </View>
          <Text style={styles.completedTitle}>Workout Completed!</Text>
          <Text style={styles.completedSubtitle}>
            You&#39;ve crushed it today!
          </Text>
        </View>
        {/* Workout stats summary */}
        <View style={styles.statsContainer}>
          {/* Duration Stat */}
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color="#9512af" />
            <Text style={styles.statValue}>
              {formatDuration(stats.duration)}
            </Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          {/* Calories Stat */}
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={24} color="#9512af" />
            <Text style={styles.statValue}>{stats.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>

          {/* Exercises Stat */}
          <View style={styles.statItem}>
            <Ionicons name="fitness-outline" size={24} color="#9512af" />
            <Text style={styles.statValue}>{stats.exercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>
        {/* Share button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            console.log("Share workout"); // Share logic to be implemented
          }}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.shareButtonText}>Share Results</Text>
        </TouchableOpacity>
        {/* Done button to go back to dashboard */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.push("/(tabs)/dashboard")}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet for all components
const styles = StyleSheet.create({
  container: {
    flex: 1, // Fill full height
    backgroundColor: "#efdff1", // Soft purple background
  },
  content: {
    flex: 1,
    paddingHorizontal: 24, // Horizontal padding for content
    paddingTop: 16, // Top padding
  },
  header: {
    alignItems: "flex-end", // Align close button to top-right
  },
  completedContainer: {
    alignItems: "center", // Center check icon and text
    marginTop: 60,
    marginBottom: 60,
  },
  completedIconContainer: {
    marginBottom: 24, // Space between icon and title
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row", // Horizontal layout for stats
    justifyContent: "space-around", // Even spacing
    marginBottom: 60,
  },
  statItem: {
    alignItems: "center", // Center each stat icon + text
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  shareButton: {
    backgroundColor: "#9512af", // Purple button
    borderRadius: 25,
    height: 56,
    flexDirection: "row", // Icon + text side-by-side
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8, // Space between icon and text
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "transparent", // No fill color
    borderWidth: 2,
    borderColor: "#9512af", // Purple border
    borderRadius: 25,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#9512af", // Purple text
    fontSize: 16,
    fontWeight: "600",
  },
});
