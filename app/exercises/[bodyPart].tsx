import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OfflineMessage from "../../components/OfflineMessage";
import {
  ApiOfflineError,
  exerciseApi,
  type Exercise,
} from "../../services/exerciseApi";

/**
 * ExercisesByBodyPart Component
 *
 * Displays a list of exercises filtered by a specific body part.
 * Handles loading states, offline scenarios, and navigation to exercise details.
 *
 * Route: Expects a 'bodyPart' parameter from the URL
 */
export default function ExercisesByBodyPart() {
  // Extract the bodyPart parameter from the route
  const { bodyPart } = useLocalSearchParams<{ bodyPart: string }>();

  // State management for component data and UI states
  const [exercises, setExercises] = useState<Exercise[]>([]); // List of exercises for the selected body part
  const [loading, setLoading] = useState(true); // Loading indicator state
  const [isOffline, setIsOffline] = useState(false); // Offline mode state
  const [offlineMessage, setOfflineMessage] = useState(""); // Custom offline message

  // Load exercises when component mounts or bodyPart changes
  useEffect(() => {
    loadExercises();
  }, [bodyPart]);

  /**
   * Fetches exercises for the selected body part from the API
   * Handles loading states and error scenarios including offline mode
   */
  const loadExercises = async () => {
    // Early return if no body part is specified
    if (!bodyPart) return;

    try {
      // Reset states and show loading
      setLoading(true);
      setIsOffline(false);

      // Fetch exercises from API
      const data = await exerciseApi.getExercisesByBodyPart(bodyPart);
      setExercises(data);
    } catch (error) {
      // Handle different types of errors
      if (error instanceof ApiOfflineError) {
        // Use custom offline error message
        setIsOffline(true);
        setOfflineMessage(error.message);
      } else {
        // Generic offline message for other errors
        setIsOffline(true);
        setOfflineMessage(
          "Exercise database is currently offline. We're working to restore the service."
        );
      }
      // Clear exercises on error
      setExercises([]);
    } finally {
      // Always hide loading indicator
      setLoading(false);
    }
  };

  /**
   * Navigates to exercise details page when an exercise is selected
   * @param exercise - The selected exercise object
   */
  const handleExercisePress = (exercise: Exercise) => {
    router.push(`/exercise-details/${exercise.id}`);
  };

  /**
   * Handles back button press to return to previous screen
   */
  const handleBackPress = () => {
    router.back();
  };

  // Loading state UI - shows spinner and loading text
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.placeholder} />
        </View>
        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9512af" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Offline state UI - shows offline message component
  if (isOffline) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercises</Text>
          <View style={styles.placeholder} />
        </View>
        {/* Offline message component */}
        <OfflineMessage
          title="Exercise Database Offline"
          message={offlineMessage}
        />
      </SafeAreaView>
    );
  }

  /**
   * Renders individual exercise item in the FlatList
   * @param item - Exercise object to render
   */
  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleExercisePress(item)}
    >
      <View style={styles.exerciseInfo}>
        {/* Exercise name */}
        <Text style={styles.exerciseName}>{item.name}</Text>
        {/* Target muscle group */}
        <Text style={styles.exerciseTarget}>Target: {item.target}</Text>
        {/* Required equipment */}
        <Text style={styles.exerciseEquipment}>
          Equipment: {item.equipment}
        </Text>
        {/* Badges for body part and difficulty */}
        <View style={styles.badgeContainer}>
          {/* Body part badge */}
          <View style={styles.bodyPartBadge}>
            <Text style={styles.bodyPartText}>{item.bodyPart}</Text>
          </View>
          {/* Difficulty badge with dynamic color */}
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
      {/* Forward chevron icon */}
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  /**
   * Returns appropriate color for difficulty level badge
   * @param difficulty - The difficulty level string
   * @returns Hex color code for the difficulty level
   */
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "#4CAF50"; // Green for beginner
      case "intermediate":
        return "#FF9800"; // Orange for intermediate
      case "advanced":
        return "#F44336"; // Red for advanced
      default:
        return "#9E9E9E"; // Gray for unknown difficulty
    }
  };

  // Main component render - shows exercises list
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        {/* Dynamic title with capitalized body part name */}
        <Text style={styles.headerTitle}>
          {bodyPart
            ? bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)
            : "Exercises"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main content area */}
      <View style={styles.content}>
        {/* Exercise count display */}
        <Text style={styles.exerciseCount}>
          {exercises.length} exercises found
        </Text>
        {/* Exercises list */}
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

// StyleSheet with comprehensive styling for all components
const styles = StyleSheet.create({
  // Main container with light background
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  // Header container with white background and bottom border
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  // Back button with padding for easier touch
  backButton: {
    padding: 4,
  },
  // Header title styling
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  // Placeholder to balance header layout
  placeholder: {
    width: 32,
  },
  // Loading state container - centered content
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Loading text styling
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  // Main content container
  content: {
    flex: 1,
  },
  // Exercise count text styling
  exerciseCount: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // FlatList container with padding
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // Individual exercise card styling with shadow
  exerciseCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Exercise information container
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  // Exercise name styling
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  // Target muscle styling
  exerciseTarget: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  // Equipment text styling
  exerciseEquipment: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  // Badge container for body part and difficulty
  badgeContainer: {
    flexDirection: "row",
    gap: 6,
  },
  // Body part badge with light purple background
  bodyPartBadge: {
    backgroundColor: "#F3E8F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  // Body part text with purple color
  bodyPartText: {
    fontSize: 10,
    color: "#9512af",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  // Difficulty badge with dynamic background color
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  // Difficulty text with white color
  difficultyText: {
    fontSize: 10,
    color: "white",
    fontWeight: "500",
  },
});
