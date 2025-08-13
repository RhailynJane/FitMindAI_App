"use client";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import {
  ApiOfflineError,
  exerciseApi,
  type Exercise,
} from "../../services/exerciseApi";
import { firestoreService } from "../../services/firestoreService";

/**
 * ExerciseDetailsScreen Component
 *
 * Displays detailed information about a specific exercise including:
 * - Exercise demonstration GIF/image
 * - Comprehensive exercise metadata (target muscles, equipment, difficulty)
 * - Step-by-step instructions
 * - Secondary muscle groups
 * - Interactive "Add to Workout" functionality with customizable parameters
 * - Success feedback with navigation options
 *
 * Features modal-based workout creation with form validation and error handling.
 */
export default function ExerciseDetailsScreen() {
  // Extract exercise ID from route parameters
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth(); // Current authenticated user
  const insets = useSafeAreaInsets(); // Safe area handling for different devices

  // Core exercise data state
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal visibility states for user interactions
  const [showAddModal, setShowAddModal] = useState(false); // Add to workout form
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success feedback

  // Workout customization form state
  const [workoutName, setWorkoutName] = useState(""); // User-defined workout name
  const [sets, setSets] = useState("3"); // Number of sets (default: 3)
  const [reps, setReps] = useState("12"); // Repetitions per set (default: 12)
  const [duration, setDuration] = useState(""); // Duration in seconds (optional)
  const [restTime, setRestTime] = useState("60"); // Rest time between sets (default: 60s)

  /**
   * Load exercise data when component mounts or ID changes
   * Automatically fetches exercise details from API
   */
  useEffect(() => {
    if (id) {
      loadExercise();
    }
  }, [id]);

  /**
   * Fetches detailed exercise information from the API
   * Handles offline scenarios and API errors gracefully
   * Pre-populates workout form with exercise name
   */
  const loadExercise = async () => {
    try {
      setLoading(true);
      // Fetch exercise data using the provided ID
      const exerciseData = await exerciseApi.getExerciseById(id!);
      setExercise(exerciseData);

      // Pre-populate workout name with exercise name for user convenience
      setWorkoutName(`${exerciseData.name} Workout`);
    } catch (error) {
      // Handle different error types with appropriate user feedback
      if (error instanceof ApiOfflineError) {
        Alert.alert(
          "Offline",
          "Exercise database is currently offline. Please try again later."
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to load exercise details. Please try again."
        );
      }
      console.error("Error loading exercise:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles adding the current exercise to user's workout plans
   * Validates user authentication and form data before submission
   * Creates a new workout plan with customizable exercise parameters
   */
  const handleAddToWorkout = async () => {
    // Authentication check - ensure user is logged in
    if (!user || !exercise) {
      Alert.alert("Error", "Please sign in to add exercises to your workout.");
      return;
    }

    try {
      // Build exercise configuration object with user-defined parameters
      const workoutExercise = {
        exercise: {
          // Core exercise data from API
          id: exercise.id,
          name: exercise.name,
          bodyPart: exercise.bodyPart,
          target: exercise.target,
          equipment: exercise.equipment,
          gifUrl: exercise.gifUrl,
          // Optional fields with fallback to empty arrays/strings
          instructions: exercise.instructions || [],
          secondaryMuscles: exercise.secondaryMuscles || [],
          difficulty: exercise.difficulty,
          category: exercise.category,
          description: exercise.description || "",
        },
        // User-customizable workout parameters with validation
        sets: Number.parseInt(sets) || 3, // Default to 3 sets if invalid input
        reps: Number.parseInt(reps) || 12, // Default to 12 reps if invalid input
        duration: duration ? Number.parseInt(duration) : null, // Optional duration
        restTime: Number.parseInt(restTime) || 60, // Default to 60 seconds rest
      };

      // Create workout plan object for Firestore storage
      const workoutData = {
        name: workoutName || `${exercise.name} Workout`, // Fallback name if empty
        exercises: [workoutExercise], // Single exercise workout plan
        isCustom: true, // Flag indicating user-created workout
        category: exercise.bodyPart, // Categorize by target body part
      };

      // Save workout to user's Firestore collection
      await firestoreService.addWorkoutToUser(user.uid, workoutData);

      // Close form modal and show success feedback
      setShowAddModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error adding to workout:", error);
      Alert.alert(
        "Error",
        "Failed to add exercise to workout. Please try again."
      );
    }
  };

  /**
   * Navigation handler for "View Plans" action after successful workout creation
   * Closes success modal and navigates to workout plans tab
   */
  const handleViewPlans = () => {
    setShowSuccessModal(false);
    router.push("/(tabs)/workout-plans");
  };

  /**
   * Handler for "Continue" action after successful workout creation
   * Simply closes the success modal, allowing user to stay on current screen
   */
  const handleContinue = () => {
    setShowSuccessModal(false);
  };

  // Loading State UI - shown while fetching exercise data
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header with back navigation */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading exercise details...</Text>
        </View>
      </View>
    );
  }

  // Error State UI - shown when exercise data couldn't be loaded
  if (!exercise) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Exercise not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Section */}
      {/* Navigation header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise Details</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          // Platform-specific bottom padding for floating action button clearance
          paddingBottom: Platform.OS === "ios" ? 120 : 100,
        }}
      >
        {/* Exercise Demonstration Media */}
        {/* GIF or image showing proper exercise form */}
        <View style={styles.imageContainer}>
          {exercise.gifUrl ? (
            <Image
              source={{ uri: exercise.gifUrl }}
              style={styles.exerciseImage}
              resizeMode="contain" // Maintain aspect ratio
            />
          ) : (
            // Fallback UI when no demonstration media is available
            <View style={styles.placeholderImage}>
              <Ionicons name="fitness-outline" size={64} color="#ccc" />
            </View>
          )}
        </View>

        {/* Exercise Information Section */}
        {/* Comprehensive exercise metadata and details */}
        <View style={styles.infoContainer}>
          {/* Exercise Name */}
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          {/* Exercise Classification Tags */}
          {/* Visual tags for body part, difficulty, and category */}
          <View style={styles.tagsContainer}>
            {/* Body Part Tag - primary muscle group */}
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exercise.bodyPart}</Text>
            </View>
            {/* Difficulty Level Tag - green color coding */}
            <View style={[styles.tag, styles.difficultyTag]}>
              <Text style={styles.tagText}>{exercise.difficulty}</Text>
            </View>
            {/* Exercise Category Tag - blue color coding */}
            <View style={[styles.tag, styles.categoryTag]}>
              <Text style={styles.tagText}>{exercise.category}</Text>
            </View>
          </View>

          {/* Key Exercise Details */}
          {/* Target muscle and required equipment information */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="body-outline" size={24} color="#9512af" />
              <Text style={styles.detailLabel}>Target</Text>
              <Text style={styles.detailValue}>{exercise.target}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="barbell-outline" size={24} color="#9512af" />
              <Text style={styles.detailLabel}>Equipment</Text>
              <Text style={styles.detailValue}>{exercise.equipment}</Text>
            </View>
          </View>

          {/* Secondary Muscles Section */}
          {/* Additional muscle groups worked during the exercise */}
          {exercise.secondaryMuscles &&
            exercise.secondaryMuscles.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Secondary Muscles</Text>
                <View style={styles.musclesList}>
                  {exercise.secondaryMuscles.map((muscle, index) => (
                    <View key={index} style={styles.muscleTag}>
                      <Text style={styles.muscleText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {/* Exercise Instructions Section */}
          {/* Step-by-step guide for proper exercise execution */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {exercise.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  {/* Numbered step indicator */}
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  {/* Instruction text content */}
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Exercise Description Section */}
          {/* Additional context or benefits of the exercise */}
          {exercise.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{exercise.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {/* Primary call-to-action for adding exercise to workout */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.addButtonText}>Add to Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Add to Workout Modal */}
      {/* Customization form for workout parameters */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Workout</Text>

            {/* Workout Name Input */}
            {/* Allow users to customize the workout plan name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Workout Name</Text>
              <TextInput
                style={styles.textInput}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="Enter workout name"
              />
            </View>

            {/* Sets and Reps Input Row */}
            {/* Side-by-side numeric inputs for workout parameters */}
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.numberInput}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.numberInput}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                  placeholder="12"
                />
              </View>
            </View>

            {/* Duration and Rest Time Input Row */}
            {/* Additional timing parameters for workout customization */}
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (sec)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="Optional" // Optional field for timed exercises
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rest (sec)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={restTime}
                  onChangeText={setRestTime}
                  keyboardType="numeric"
                  placeholder="60"
                />
              </View>
            </View>

            {/* Modal Action Buttons */}
            {/* Cancel and confirm actions for the form */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddToWorkout}
              >
                <Text style={styles.confirmButtonText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Confirmation Modal */}
      {/* Feedback modal shown after successful workout creation */}
      <Modal visible={showSuccessModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            {/* Success Icon */}
            {/* Green checkmark indicating successful operation */}
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="white" />
            </View>

            {/* Success Message */}
            <Text style={styles.successTitle}>Workout Added!</Text>
            <Text style={styles.successMessage}>
              &quot;{exercise.name}&quot; has been added to your workout plans.
            </Text>

            {/* Success Action Buttons */}
            {/* Navigation options after successful creation */}
            <View style={styles.successButtons}>
              {/* Continue on current screen */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
              {/* Navigate to workout plans */}
              <TouchableOpacity
                style={styles.viewPlansButton}
                onPress={handleViewPlans}
              >
                <Text style={styles.viewPlansButtonText}>View Plans</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container with light background
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Header with back navigation and title
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
  },

  // Back button with spacing from title
  backButton: {
    marginRight: 16,
  },

  // Header title styling
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  // Centered loading state container
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Scrollable content area
  content: {
    flex: 1,
  },

  // Container for exercise demonstration media
  imageContainer: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
  },

  // Exercise GIF/image styling
  exerciseImage: {
    width: 200,
    height: 200,
  },

  // Fallback placeholder when no media is available
  placeholderImage: {
    width: 200,
    height: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Main information container with white background
  infoContainer: {
    backgroundColor: "white",
    marginTop: 8, // Small gap from image section
    padding: 20,
  },

  // Exercise name title
  exerciseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textTransform: "capitalize", // Ensure proper capitalization
  },

  // Container for classification tags
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allow wrapping for multiple tags
    marginBottom: 20,
    gap: 8, // Space between tags
  },

  // Base tag styling with brand purple background
  tag: {
    backgroundColor: "#9512af",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16, // Pill-shaped tags
  },

  // Difficulty tag with green background
  difficultyTag: {
    backgroundColor: "#4CAF50",
  },

  // Category tag with blue background
  categoryTag: {
    backgroundColor: "#2196F3",
  },

  // Tag text styling
  tagText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  // Horizontal layout for exercise details
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },

  // Individual detail item (target, equipment)
  detailItem: {
    alignItems: "center",
    flex: 1,
  },

  // Detail label text
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },

  // Detail value text with emphasis
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    textTransform: "capitalize",
  },

  // Generic section container with bottom margin
  section: {
    marginBottom: 24,
  },

  // Section title styling
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },

  // Container for secondary muscles tags
  musclesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // Individual secondary muscle tag
  muscleTag: {
    backgroundColor: "#f0f0f0", // Light gray background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  // Secondary muscle text styling
  muscleText: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },

  // Individual instruction step container
  instructionItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start", // Align to top for multi-line text
  },

  // Circular number indicator for instruction steps
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#9512af", // Brand purple
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2, // Slight offset for text alignment
  },

  // Number text inside instruction indicator
  instructionNumberText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  // Instruction text content
  instructionText: {
    flex: 1, // Take remaining space
    fontSize: 14,
    color: "#333",
    lineHeight: 20, // Improved readability
  },

  // Exercise description text
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // Floating action button container
  bottomContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0", // Subtle separator
  },

  // Primary add to workout button
  addButton: {
    backgroundColor: "#9512af", // Brand purple
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8, // Space between icon and text
  },

  // Add button text styling
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Semi-transparent overlay for modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 50% opacity dark overlay
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // Main modal content container
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400, // Constrain width on larger screens
  },

  // Modal title styling
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },

  // Form input group container
  inputGroup: {
    marginBottom: 16,
    flex: 1,
  },

  // Input field label
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },

  // Text input field styling
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },

  // Horizontal container for paired inputs
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12, // Space between paired inputs
  },

  // Numeric input with center alignment
  numberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "center", // Center-align numbers
  },

  // Modal action buttons container
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },

  // Cancel button with outline style
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  // Cancel button text styling
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },

  // Confirm button with brand background
  confirmButton: {
    flex: 1,
    backgroundColor: "#9512af",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  // Confirm button text styling
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Success modal content container (smaller than main modal)
  successModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },

  // Success checkmark icon container
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4CAF50", // Green success color
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  // Success modal title
  successTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  // Success modal message text
  successMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },

  // Success modal buttons container
  successButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  // Continue button (secondary action)
  continueButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  // Continue button text
  continueButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },

  // View plans button (primary action)
  viewPlansButton: {
    flex: 1,
    backgroundColor: "#9512af",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  // View plans button text
  viewPlansButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
