"use client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import {
  firestoreService,
  type UserWorkout,
} from "../../services/firestoreService";

// Get device width for responsive design calculations
const { width } = Dimensions.get("window");

/**
 * WorkoutPlansScreen Component
 *
 * Main screen for displaying and managing workout plans. Features:
 * - AI coach recommendations with custom illustrations
 * - Tab navigation between featured workouts and user's personal plans
 * - CRUD operations for user workouts (view, start, delete)
 * - Interactive cards with gradient backgrounds and progress tracking
 * - Empty state handling with call-to-action buttons
 */
export default function WorkoutPlansScreen() {
  // Authentication and navigation hooks
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // For safe area handling on different devices

  // Component state management
  const [workouts, setWorkouts] = useState<UserWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"start" | "myPlans">("start");

  /**
   * Load user workouts when component mounts or user changes
   * Automatically fetches and sets workout data from Firestore
   */
  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user]);

  /**
   * Fetches user's workout plans from Firestore
   * Handles loading states and error cases gracefully
   */
  const loadWorkouts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userWorkouts = await firestoreService.getUserWorkouts(user.uid);
      setWorkouts(userWorkouts);
      console.log("Loaded workouts:", userWorkouts.length);
    } catch (error) {
      console.error("Error loading workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles workout deletion with confirmation dialog
   * @param workoutId - Unique identifier for the workout to delete
   * @param workoutName - Display name for confirmation dialog
   */
  const handleDeleteWorkout = async (
    workoutId: string,
    workoutName: string
  ) => {
    Alert.alert(
      "Delete Workout",
      `Are you sure you want to delete "${workoutName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting workout:", workoutId);
              await firestoreService.deleteUserWorkout(workoutId);
              // Optimistically update UI by removing from local state
              setWorkouts((prevWorkouts) =>
                prevWorkouts.filter((w) => w.id !== workoutId)
              );
              console.log("Workout deleted successfully");
            } catch (error) {
              console.error("Error deleting workout:", error);
              Alert.alert(
                "Error",
                "Failed to delete workout. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  /**
   * Initiates a workout session and navigates to workout screen
   * Creates a new session in Firestore and navigates to session view
   * @param workout - The workout plan to start
   */
  const startWorkout = async (workout: UserWorkout) => {
    if (!user) return;

    try {
      console.log("Starting workout:", workout.name);
      // Create new workout session in Firestore
      const sessionId = await firestoreService.startWorkoutSession(
        user.uid,
        workout.id,
        workout
      );
      // Navigate to workout session screen with session ID
      router.push(`/workout-session/${sessionId}`);
    } catch (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Failed to start workout. Please try again.");
    }
  };

  /**
   * Navigates to AI chat for personalized workout recommendations
   */
  const handleAICoachRecommendation = () => {
    router.push("/ai-chat");
  };

  // Loading state UI - shown while fetching workout data
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header with loading state */}
        <View style={styles.header}>
          <Ionicons name="menu" size={24} color="#333" />
          <Text style={styles.headerTitle}>Workout Plans</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading your workouts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Section */}
      {/* Navigation header with menu icon and title */}
      <View style={styles.header}>
        <Ionicons name="menu" size={24} color="#333" />
        <Text style={styles.headerTitle}>Workout Plans</Text>
        {/* Spacer for center alignment */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          // Platform-specific bottom padding for tab bar clearance
          paddingBottom: Platform.OS === "ios" ? 100 : 80,
        }}
      >
        {/* AI Coach Recommendations Section */}
        {/* Gradient card promoting AI-powered workout recommendations */}
        <LinearGradient
          colors={["#F8E8FF", "#E8D5FF"]} // Light purple gradient
          style={styles.aiCoachCard}
        >
          <View style={styles.aiCoachContent}>
            {/* Text content for AI coach section */}
            <View style={styles.aiCoachText}>
              <Text style={styles.aiCoachTitle}>AI Coach Recommendations</Text>
              <Text style={styles.aiCoachDescription}>
                Based on your fitness level and goals, the AI recommends this
                plan is perfect for you. It combines strength and cardio for
                optimal results.
              </Text>
              <TouchableOpacity
                style={styles.aiCoachButton}
                onPress={handleAICoachRecommendation}
              >
                <Text style={styles.aiCoachButtonText}>
                  Start Recommended Plan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom illustration of person exercising */}
            <View style={styles.aiCoachIllustration}>
              <View style={styles.personIllustration}>
                {/* SVG-style person made with React Native Views */}
                <View style={styles.personHead} />
                <View style={styles.personBody} />
                <View style={styles.personArm} />
                <View style={[styles.personArm, styles.personArmRight]} />
                <View style={styles.personLeg} />
                <View style={[styles.personLeg, styles.personLegRight]} />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Tab Navigation */}
        {/* Toggle between featured workouts and user's personal plans */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "start" && styles.activeTab]}
            onPress={() => setActiveTab("start")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "start" && styles.activeTabText,
              ]}
            >
              Start
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "myPlans" && styles.activeTab]}
            onPress={() => setActiveTab("myPlans")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "myPlans" && styles.activeTabText,
              ]}
            >
              {/* Show workout count in tab title */}
              My Plans ({workouts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content - Featured Workouts */}
        {activeTab === "start" ? (
          <View>
            {/* Featured Workout Card - Balance Boost */}
            {/* Promotional card for featured yoga/strength workout */}
            <LinearGradient
              colors={["#FF6B9D", "#C44CAE"]} // Pink gradient
              style={styles.featuredCard}
            >
              <View style={styles.featuredContent}>
                {/* Workout description */}
                <View style={styles.featuredText}>
                  <Text style={styles.featuredTitle}>Balance Boost</Text>
                  <Text style={styles.featuredDescription}>
                    Gentle yoga, along with strength training
                  </Text>
                </View>

                {/* Custom yoga person illustration */}
                <View style={styles.featuredIllustration}>
                  <View style={styles.yogaPersonContainer}>
                    <View style={styles.yogaPerson}>
                      {/* Stylized yoga pose figure */}
                      <View style={styles.yogaHead} />
                      <View style={styles.yogaBody} />
                      <View style={styles.yogaArm} />
                      <View style={[styles.yogaArm, styles.yogaArmRight]} />
                      <View style={styles.yogaLeg} />
                      <View style={[styles.yogaLeg, styles.yogaLegRight]} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Workout Statistics */}
              {/* Display key metrics for the workout plan */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>50</Text>
                  <Text style={styles.statLabel}>days</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>35</Text>
                  <Text style={styles.statLabel}>workouts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10,000</Text>
                  <Text style={styles.statLabel}>points</Text>
                </View>
              </View>

              {/* Call-to-action button */}
              <TouchableOpacity style={styles.startPlanButton}>
                <Text style={styles.startPlanButtonText}>Start Plan</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Transformation Challenge Card */}
            {/* Secondary promotional card for 30-day challenge */}
            <LinearGradient
              colors={["#FF6B9D", "#C44CAE"]}
              style={styles.transformationCard}
            >
              <Text style={styles.transformationTitle}>
                30 days Transformation
              </Text>
              <Text style={styles.transformationSubtitle}>
                Complete body Transformation with
              </Text>
            </LinearGradient>
          </View>
        ) : (
          /* Tab Content - User's Personal Plans */
          <View>
            {/* Empty State - No Workouts */}
            {workouts.length === 0 ? (
              <View style={styles.emptyContainer}>
                {/* Empty state illustration */}
                <Ionicons name="fitness-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No workout plans yet</Text>
                <Text style={styles.emptyText}>
                  Add exercises to create your first workout plan!
                </Text>
                {/* Call-to-action to browse exercises */}
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => router.push("/(tabs)/workout")}
                >
                  <Text style={styles.browseButtonText}>Browse Exercises</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* User's Workout Plans List */
              /* Dynamic list of user-created workout plans */
              workouts.map((workout, index) => (
                <LinearGradient
                  key={workout.id}
                  // Alternate gradient colors for visual variety
                  colors={
                    index % 2 === 0
                      ? ["#FF6B9D", "#C44CAE"] // Pink gradient
                      : ["#6B73FF", "#4E54C8"] // Blue gradient
                  }
                  style={styles.workoutCard}
                >
                  {/* Workout Header with Info and Delete Button */}
                  <View style={styles.workoutHeader}>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{workout.name}</Text>
                      <Text style={styles.workoutDescription}>
                        {workout.exercises.length} exercise
                        {workout.exercises.length !== 1 ? "s" : ""} for{" "}
                        {workout.category}
                      </Text>
                    </View>
                    {/* Delete workout button */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDeleteWorkout(workout.id, workout.name)
                      }
                    >
                      <Ionicons name="trash-outline" size={20} color="white" />
                    </TouchableOpacity>
                  </View>

                  {/* Progress Indicator */}
                  {/* Shows workout completion percentage */}
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>48% complete</Text>
                    <View style={styles.progressBar}>
                      {/* Progress bar fill - TODO: Make dynamic based on actual progress */}
                      <View style={[styles.progressFill, { width: "48%" }]} />
                    </View>
                  </View>

                  {/* Workout Statistics */}
                  {/* Display workout duration and session count */}
                  <View style={styles.workoutStatsContainer}>
                    <View style={styles.workoutStatItem}>
                      <Text style={styles.workoutStatNumber}>30</Text>
                      <Text style={styles.workoutStatLabel}>days</Text>
                    </View>
                    <View style={styles.workoutStatItem}>
                      <Text style={styles.workoutStatNumber}>24</Text>
                      <Text style={styles.workoutStatLabel}>workouts</Text>
                    </View>
                  </View>

                  {/* Continue Workout Button */}
                  {/* Primary action to start/continue the workout */}
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => startWorkout(workout)}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </LinearGradient>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container with light background
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Header with navigation elements and bottom border
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Header title styling
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  // Loading state container - centered content
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Main scrollable content area
  content: {
    flex: 1,
    padding: 20,
  },

  // AI Coach recommendation card styling
  aiCoachCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  // Horizontal layout for AI coach content and illustration
  aiCoachContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Text content area with right padding for illustration space
  aiCoachText: {
    flex: 1,
    paddingRight: 15,
  },

  // AI coach section title
  aiCoachTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  // AI coach description text
  aiCoachDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    marginBottom: 15,
  },

  // CTA button for AI coach recommendations
  aiCoachButton: {
    backgroundColor: "#9512af", // Brand purple color
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start", // Size to content
  },

  // AI coach button text styling
  aiCoachButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  // Container for AI coach illustration
  aiCoachIllustration: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  // Base container for person illustration
  personIllustration: {
    position: "relative", // For absolute positioned arms/legs
  },

  // Person's head - circular shape
  personHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFB6C1", // Light pink for skin
    marginBottom: 2,
  },

  // Person's body - rounded rectangle
  personBody: {
    width: 16,
    height: 25,
    backgroundColor: "#FF69B4", // Hot pink for clothing
    borderRadius: 8,
    marginBottom: 2,
  },

  // Person's left arm - positioned and rotated
  personArm: {
    position: "absolute",
    width: 3,
    height: 15,
    backgroundColor: "#FFB6C1",
    borderRadius: 2,
    top: 22,
    left: -5,
    transform: [{ rotate: "-30deg" }],
  },

  // Person's right arm - mirrored positioning
  personArmRight: {
    left: 18,
    transform: [{ rotate: "30deg" }],
  },

  // Person's leg styling
  personLeg: {
    width: 4,
    height: 20,
    backgroundColor: "#333", // Dark color for pants/legs
    borderRadius: 2,
    marginLeft: 2,
  },

  // Right leg positioning
  personLegRight: {
    marginLeft: 10,
    marginTop: -20, // Overlap to create proper leg positioning
  },

  // Tab container with rounded background
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },

  // Individual tab styling
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
  },

  // Active tab background
  activeTab: {
    backgroundColor: "#333",
  },

  // Default tab text color
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },

  // Active tab text color
  activeTabText: {
    color: "white",
  },

  // Featured workout card with gradient background
  featuredCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  // Horizontal layout for featured workout content
  featuredContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  // Text area for featured workout
  featuredText: {
    flex: 1,
  },

  // Featured workout title
  featuredTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },

  // Featured workout description
  featuredDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)", // Semi-transparent white
  },

  // Container for featured workout illustration
  featuredIllustration: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  // Background circle for yoga person illustration
  yogaPersonContainer: {
    backgroundColor: "rgba(255,255,255,0.2)", // Semi-transparent white
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  // Base container for yoga person figure
  yogaPerson: {
    position: "relative",
  },

  // Yoga person's head
  yogaHead: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFB6C1",
    marginBottom: 2,
  },

  // Yoga person's body
  yogaBody: {
    width: 12,
    height: 20,
    backgroundColor: "white",
    borderRadius: 6,
    marginBottom: 2,
  },

  // Yoga person's left arm - yoga pose position
  yogaArm: {
    position: "absolute",
    width: 2,
    height: 12,
    backgroundColor: "#FFB6C1",
    borderRadius: 1,
    top: 18,
    left: -4,
    transform: [{ rotate: "-45deg" }], // Yoga pose angle
  },

  // Yoga person's right arm
  yogaArmRight: {
    left: 14,
    transform: [{ rotate: "45deg" }],
  },

  // Yoga person's left leg - bent for yoga pose
  yogaLeg: {
    width: 3,
    height: 15,
    backgroundColor: "#333",
    borderRadius: 2,
    marginLeft: 1,
    transform: [{ rotate: "-20deg" }],
  },

  // Yoga person's right leg
  yogaLegRight: {
    marginLeft: 8,
    marginTop: -15,
    transform: [{ rotate: "20deg" }],
  },

  // Container for workout statistics display
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },

  // Individual stat item (days, workouts, points)
  statItem: {
    alignItems: "center",
  },

  // Large number display for stats
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },

  // Label below stat numbers
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  // Primary button for starting featured workout
  startPlanButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },

  // Start plan button text (brand color on white background)
  startPlanButtonText: {
    color: "#9512af",
    fontSize: 16,
    fontWeight: "600",
  },

  // Secondary promotional card for transformation challenge
  transformationCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  // Transformation card title
  transformationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },

  // Transformation card subtitle
  transformationSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },

  // Empty state container when user has no workouts
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },

  // Empty state title text
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },

  // Empty state description text
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },

  // CTA button for empty state
  browseButton: {
    backgroundColor: "#9512af",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },

  // Browse button text styling
  browseButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // User's workout plan cards
  workoutCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  // Header area of workout card with delete button
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },

  // Workout information area (name and description)
  workoutInfo: {
    flex: 1,
  },

  // Workout name/title styling
  workoutName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },

  // Workout description (exercise count and category)
  workoutDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },

  // Delete button with semi-transparent background
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Progress section container
  progressContainer: {
    marginBottom: 15,
  },

  // Progress percentage text
  progressText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
    textAlign: "right",
  },

  // Progress bar background
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },

  // Progress bar fill (represents completion percentage)
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },

  // Container for workout-specific statistics
  workoutStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },

  // Individual workout stat item
  workoutStatItem: {
    alignItems: "center",
  },

  // Workout stat number (smaller than featured stats)
  workoutStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },

  // Workout stat label
  workoutStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  // Continue workout button (primary action)
  continueButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },

  // Continue button text styling
  continueButtonText: {
    color: "#9512af",
    fontSize: 16,
    fontWeight: "600",
  },
});
