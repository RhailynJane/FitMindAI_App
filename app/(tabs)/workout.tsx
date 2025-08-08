"use client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ApiStatusChecker from "../../components/ApiStatusChecker";
import OfflineMessage from "../../components/OfflineMessage";
import { ApiOfflineError, exerciseApi } from "../../services/exerciseApi";

/**
 * Interface for quick workout cards data structure
 * Represents pre-defined workout routines with visual styling
 */
interface QuickWorkout {
  id: string;
  title: string;
  duration: string;
  level: string;
  color: string; // Hex color for card background gradient
}

/**
 * Mapping of body part names to corresponding Ionicons
 * Provides consistent iconography across the exercise browsing experience
 * Falls back to 'fitness-outline' if no specific icon is mapped
 */
const bodyPartIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  back: "body-outline",
  cardio: "heart-outline",
  chest: "fitness-outline",
  "lower arms": "hand-left-outline",
  "lower legs": "walk-outline",
  neck: "person-outline",
  shoulders: "body-outline",
  "upper arms": "barbell-outline",
  "upper legs": "walk-outline",
  waist: "body-outline",
};

/**
 * WorkoutScreen Component
 *
 * Main workout browsing screen that provides:
 * - Quick workout cards for immediate access to pre-built routines
 * - Body part navigation grid for exercise discovery
 * - Offline support with fallback data
 * - Pull-to-refresh functionality
 * - API status monitoring and error handling
 */
export default function WorkoutScreen() {
  // State management for workout data and UI states
  const [quickWorkouts, setQuickWorkouts] = useState<QuickWorkout[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Pull-to-refresh state
  const [isOffline, setIsOffline] = useState(false); // Network connectivity status
  const router = useRouter();

  /**
   * Fallback quick workout data for offline scenarios
   * Pre-defined workouts that don't require API connectivity
   * Each workout has different styling and difficulty levels
   */
  const defaultQuickWorkouts: QuickWorkout[] = [
    {
      id: "1",
      title: "Morning Energy Boost",
      duration: "15 min",
      level: "Beginner",
      color: "#FF6B9D", // Pink gradient
    },
    {
      id: "2",
      title: "Quick HIIT Blast",
      duration: "12 min",
      level: "Intermediate",
      color: "#4ECDC4", // Teal gradient
    },
    {
      id: "3",
      title: "Core Strength",
      duration: "20 min",
      level: "All Levels",
      color: "#45B7D1", // Blue gradient
    },
  ];

  /**
   * Fallback body parts list for offline scenarios
   * Comprehensive list of muscle groups covering full-body workouts
   * Used when API is unavailable to maintain app functionality
   */
  const defaultBodyParts = [
    "back",
    "cardio",
    "chest",
    "lower arms",
    "lower legs",
    "neck",
    "shoulders",
    "upper arms",
    "upper legs",
    "waist",
  ];

  /**
   * Load workout data on component mount
   * Initiates data fetching for both quick workouts and body parts
   */
  useEffect(() => {
    loadWorkoutData();
  }, []);

  /**
   * Comprehensive data loading function with offline fallback strategy
   *
   * Loading Strategy:
   * 1. Immediately load fallback data for instant UI response
   * 2. Attempt to fetch live data from API
   * 3. Replace fallback with API data if successful
   * 4. Handle offline scenarios gracefully with error states
   */
  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      setIsOffline(false);

      // Phase 1: Load quick workouts immediately (offline-ready)
      // Provides instant content while API loads in background
      setQuickWorkouts(defaultQuickWorkouts);
      console.log("Quick workouts loaded:", defaultQuickWorkouts.length);

      // Phase 2: Load fallback body parts for immediate navigation
      setBodyParts(defaultBodyParts);
      console.log("Body parts loaded:", defaultBodyParts.length);

      try {
        // Phase 3: Attempt to enhance with live API data
        // Try to get real body parts from external exercise API
        const apiBodyParts = await exerciseApi.getBodyParts();
        if (apiBodyParts && apiBodyParts.length > 0) {
          // Replace fallback data with live API data if available
          setBodyParts(apiBodyParts);
          console.log("API body parts loaded:", apiBodyParts.length);
        }
      } catch (error) {
        // Handle specific offline error vs general API errors
        if (error instanceof ApiOfflineError) {
          setIsOffline(true);
          console.log("API offline, using fallback body parts");
        } else {
          console.error("Error loading body parts:", error);
          // Continue with fallback data for any other API errors
        }
      }
    } catch (error) {
      console.error("Error loading workout data:", error);
      // Even if everything fails, fallback data is already loaded
    } finally {
      setLoading(false);
    }
  };

  /**
   * Pull-to-refresh handler
   * Allows users to manually refresh content and retry API calls
   * Useful for recovering from temporary network issues
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutData(); // Retry complete data loading process
    setRefreshing(false);
  };

  /**
   * Navigation handler for body part selection
   * Encodes body part name for URL safety and navigates to exercise list
   * @param bodyPart - Selected body part/muscle group name
   */
  const navigateToExercises = (bodyPart: string) => {
    console.log("Navigating to exercises for:", bodyPart);
    // URL encode to handle special characters and spaces
    router.push(`/exercises/${encodeURIComponent(bodyPart)}`);
  };

  /**
   * Quick workout starter function
   * Navigates to specific workout routine based on workout ID
   * @param workoutId - Unique identifier for the selected workout
   */
  const startWorkout = (workoutId: string) => {
    router.push(`/workout/${workoutId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* API Status Monitor */}
      {/* Continuously monitors network connectivity and API availability */}
      <ApiStatusChecker
        onStatusChange={(isOnline: boolean) => setIsOffline(!isOnline)}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          // Platform-specific bottom padding for tab bar clearance
          paddingBottom: Platform.OS === "ios" ? 100 : 80,
        }}
        refreshControl={
          // Pull-to-refresh functionality for manual data reload
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        {/* Welcome area with screen title and contextual subtitle */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workouts</Text>
          <Text style={styles.headerSubtitle}>Choose your workout focus</Text>
        </View>

        {/* Quick Workout Section */}
        {/* Featured workout card with key metrics display */}
        <View style={styles.section}>
          <View style={styles.quickWorkoutCard}>
            {/* Workout Metadata Header */}
            {/* Displays duration and exercise count with icons */}
            <View style={styles.quickWorkoutHeader}>
              <Ionicons name="time-outline" size={20} color="#9512af" />
              <Text style={styles.quickWorkoutDuration}>20 min</Text>
              <Ionicons name="fitness-outline" size={20} color="#9512af" />
              <Text style={styles.quickWorkoutExercises}>2 exercises</Text>
            </View>
            {/* Difficulty Level Badge */}
            <Text style={styles.quickWorkoutLevel}>All Levels</Text>
          </View>
        </View>

        {/* Offline Status Indicator */}
        {/* Shows when app is in offline mode with limited functionality */}
        {isOffline && <OfflineMessage />}

        {/* Body Parts Navigation Section */}
        {/* Grid of muscle groups for exercise discovery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Body Part</Text>
          <Text style={styles.sectionSubtitle}>
            Select a muscle group to explore exercises
          </Text>

          {/* Body Parts Grid */}
          {/* Dynamically generated list of body part navigation cards */}
          <View style={styles.bodyPartsGrid}>
            {bodyParts.map((bodyPart) => (
              <TouchableOpacity
                key={bodyPart}
                style={styles.bodyPartCard}
                onPress={() => navigateToExercises(bodyPart)}
              >
                {/* Body Part Icon */}
                {/* Circular icon container with brand-colored background */}
                <View style={styles.bodyPartIcon}>
                  <Ionicons
                    name={bodyPartIcons[bodyPart] || "fitness-outline"}
                    size={24}
                    color="#9512af"
                  />
                </View>

                {/* Body Part Name */}
                {/* Capitalized muscle group name as primary text */}
                <Text style={styles.bodyPartName}>
                  {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                </Text>

                {/* Contextual Subtext */}
                {/* Helper text explaining what user will find */}
                <Text style={styles.bodyPartSubtext}>
                  Explore {bodyPart} exercises
                </Text>

                {/* Navigation Arrow */}
                {/* Visual indicator that card is interactive */}
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#ccc"
                  style={styles.bodyPartArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main container with safe area handling
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Light gray background for contrast
  },

  // Scrollable content container
  content: {
    flex: 1,
  },

  // Header section with white background for emphasis
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },

  // Main page title styling
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  // Contextual subtitle below main title
  headerSubtitle: {
    fontSize: 14,
    color: "#666", // Muted gray for secondary text
  },

  // Generic section container with consistent spacing
  section: {
    paddingHorizontal: 20,
    marginBottom: 24, // Generous spacing between sections
  },

  // Quick workout card with elevated appearance
  quickWorkoutCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow property
    elevation: 3,
  },

  // Horizontal layout for workout metadata (time, exercises)
  quickWorkoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  // Duration text styling with icon spacing
  quickWorkoutDuration: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6, // Space after time icon
    marginRight: 16, // Space before next icon
  },

  // Exercise count text styling
  quickWorkoutExercises: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6, // Space after fitness icon
  },

  // Difficulty level badge with brand colors
  quickWorkoutLevel: {
    fontSize: 12,
    color: "#9512af", // Brand purple text
    backgroundColor: "#F3E8F5", // Light purple background
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12, // Pill-shaped badge
    alignSelf: "flex-start", // Size to content, not full width
  },

  // Section title styling
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  // Section subtitle for additional context
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20, // Space before grid content
  },

  // Container for body parts with proper spacing
  bodyPartsGrid: {
    gap: 16, // Modern CSS gap property for consistent spacing
  },

  // Individual body part card with horizontal layout
  bodyPartCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row", // Horizontal layout: icon | text | arrow
    alignItems: "center",
    // Subtle shadow for card elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Circular icon container with brand background
  bodyPartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24, // Perfect circle
    backgroundColor: "#F3E8F5", // Light purple to match brand
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16, // Space before text content
  },

  // Body part name as primary text
  bodyPartName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1, // Take available space, pushing arrow to right
    textTransform: "capitalize", // Ensure proper capitalization
  },

  // Secondary descriptive text positioned absolutely
  bodyPartSubtext: {
    fontSize: 12,
    color: "#666",
    position: "absolute",
    left: 80, // Positioned after icon (48px + 16px margin + 16px padding)
    bottom: 12, // Aligned to bottom of card
  },

  // Navigation arrow indicator
  bodyPartArrow: {
    marginLeft: 8, // Small space from text content
  },
});
