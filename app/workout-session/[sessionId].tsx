"use client";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  workoutGenerator,
  type GeneratedWorkout,
} from "../../services/workoutGenerator";

/**
 * WorkoutSessionScreen Component
 *
 * A comprehensive workout session management screen that provides:
 * - Pre-workout overview displaying exercise list and workout details
 * - Countdown timer (3-2-1) before each exercise and set
 * - Active workout interface with exercise GIF, timer, and progress tracking
 * - Pause/resume functionality for workout control
 * - Automatic progression through sets and exercises
 * - Overall workout progress visualization
 *
 * @route Expects 'id' parameter for workout identification
 */
export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Core workout data state
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);

  // Workout session control states
  const [isStarted, setIsStarted] = useState(false); // Has workout session begun
  const [isPaused, setIsPaused] = useState(false); // Is workout currently paused
  const [currentExercise, setCurrentExercise] = useState(0); // Index of current exercise (0-based)
  const [currentSet, setCurrentSet] = useState(1); // Current set number (1-based)

  // Timer-related states
  const [countdown, setCountdown] = useState(3); // Pre-exercise countdown (3, 2, 1)
  const [exerciseTime, setExerciseTime] = useState(30); // Time remaining for current exercise/set

  // Load workout data when component mounts or workout ID changes
  useEffect(() => {
    loadWorkout();
  }, [id]);

  /**
   * Main timer management effect
   * Handles all timing logic including countdown, exercise timing, and workout progression
   * Uses proper TypeScript typing for setTimeout return value
   */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>; // Properly typed timer variable

    // Only run timers when workout is active and not paused
    if (isStarted && !isPaused && workout) {
      if (countdown > 0) {
        // Countdown phase: Decrement countdown timer
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else if (exerciseTime > 0) {
        // Exercise phase: Decrement exercise timer
        timer = setTimeout(() => setExerciseTime(exerciseTime - 1), 1000);
      } else {
        // Exercise time completed: Handle progression logic
        const currentWorkoutExercise = workout.exercises[currentExercise];

        if (currentSet < currentWorkoutExercise.sets) {
          // Move to next set of current exercise
          setCurrentSet(currentSet + 1);
          setExerciseTime(currentWorkoutExercise.duration || 30);
          setCountdown(3); // Reset countdown for next set
        } else if (currentExercise < workout.exercises.length - 1) {
          // Move to next exercise (first set)
          setCurrentExercise(currentExercise + 1);
          setCurrentSet(1);
          const nextExercise = workout.exercises[currentExercise + 1];
          setExerciseTime(nextExercise.duration || 30);
          setCountdown(3); // Reset countdown for next exercise
        } else {
          // All exercises completed: Navigate to completion screen
          router.push("/workout-complete");
        }
      }
    }

    // Cleanup function to prevent memory leaks
    return () => clearTimeout(timer);
  }, [
    isStarted,
    isPaused,
    countdown,
    exerciseTime,
    currentExercise,
    currentSet,
    workout,
    router,
  ]);

  /**
   * Loads workout data from the workout generator service
   * Currently generates a sample workout - in production would fetch by provided ID
   */
  const loadWorkout = async () => {
    try {
      // Generate sample workout with predefined parameters
      // TODO: Replace with actual workout loading by ID
      const sampleWorkout = await workoutGenerator.generateWorkout({
        duration: 20,
        difficulty: "Beginner",
        bodyParts: ["chest", "upper legs"],
        equipment: ["body weight"],
        fitnessGoal: "weight_loss",
      });
      setWorkout(sampleWorkout);
    } catch (error) {
      console.error("Error loading workout:", error);
      // TODO: Add user-facing error handling
    }
  };

  /**
   * Toggles workout pause/resume state
   * Allows users to pause during exercise without losing progress
   */
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  /**
   * Skips current exercise and advances to next
   * Resets set counter and timers for next exercise
   * Navigates to completion if on last exercise
   */
  const skipExercise = () => {
    if (!workout) return;

    if (currentExercise < workout.exercises.length - 1) {
      // Advance to next exercise
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1); // Reset to first set
      const nextExercise = workout.exercises[currentExercise + 1];
      setExerciseTime(nextExercise.duration || 30);
      setCountdown(3); // Start with countdown
    } else {
      // Last exercise: Complete workout
      router.push("/workout-complete");
    }
  };

  // Helper function to format exercise duration/reps safely
  const formatExerciseTarget = (workoutEx: any) => {
    if (workoutEx.reps) {
      return `${workoutEx.reps} reps`;
    } else if (workoutEx.duration) {
      return `${workoutEx.duration}s`;
    } else {
      return "30s"; // Default fallback
    }
  };

  // Loading state: Display while fetching workout data
  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Extract current exercise data for easier access
  const currentWorkoutExercise = workout.exercises[currentExercise];
  const currentExerciseData = currentWorkoutExercise.exercise;

  /**
   * Pre-workout screen: Shows workout overview before starting
   * Displays workout details and complete exercise list
   */
  if (!isStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.preWorkoutContainer}>
          {/* Workout header information */}
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          <Text style={styles.workoutDescription}>{workout.description}</Text>

          {/* Exercise preview list */}
          <View style={styles.exerciseList}>
            {workout.exercises.map((workoutEx, index) => (
              <View key={index} style={styles.exerciseItem}>
                {/* Exercise number badge */}
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                {/* Exercise information */}
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>
                    {workoutEx.exercise.name}
                  </Text>
                  {/* Display sets × reps or sets × duration - FIXED */}
                  <Text style={styles.exerciseDuration}>
                    {workoutEx.sets} sets × {formatExerciseTarget(workoutEx)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Start workout button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setIsStarted(true)}
          >
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Countdown screen: Shows 3-2-1 countdown before each exercise/set
   * Provides preparation time and shows upcoming exercise info
   */
  if (countdown > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.countdownContainer}>
          <Text style={styles.readyText}>READY TO GO!</Text>
          {/* Large countdown display */}
          <Text style={styles.countdownText}>{countdown}</Text>
          {/* Upcoming exercise name */}
          <Text style={styles.nextExerciseText}>
            Get ready for {currentExerciseData.name}
          </Text>
          {/* Current set information */}
          <Text style={styles.setInfo}>
            Set {currentSet} of {currentWorkoutExercise.sets}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Active workout screen: Main exercise interface
   * Shows exercise GIF, timer, progress bars, and control buttons
   */
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with navigation and exercise name */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentExerciseData.name}</Text>
        {/* Spacer for centered title */}
        <View style={{ width: 24 }} />
      </View>

      {/* Main workout content area */}
      <View style={styles.workoutContainer}>
        {/* Exercise demonstration GIF */}
        <Image
          source={{ uri: currentExerciseData.gifUrl }}
          style={styles.exerciseImage}
        />

        {/* Current set indicator */}
        <View style={styles.setInfo}>
          <Text style={styles.setInfoText}>
            Set {currentSet} of {currentWorkoutExercise.sets}
          </Text>
        </View>

        {/* Exercise timer progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                // Dynamic width based on remaining exercise time
                width: `${
                  (exerciseTime / (currentWorkoutExercise.duration || 30)) * 100
                }%`,
              },
            ]}
          />
        </View>

        {/* Large timer display showing seconds remaining */}
        <Text style={styles.timerText}>{exerciseTime}</Text>

        {/* Exercise target information (reps or time) - FIXED */}
        <View style={styles.repsInfo}>
          <Text style={styles.repsText}>
            {currentWorkoutExercise.reps
              ? `${currentWorkoutExercise.reps} reps`
              : `${exerciseTime}s`}
          </Text>
        </View>

        {/* Control buttons for pause/resume and skip */}
        <View style={styles.controlsContainer}>
          {/* Pause/Resume button with dynamic icon */}
          <TouchableOpacity style={styles.controlButton} onPress={togglePause}>
            <Ionicons
              name={isPaused ? "play" : "pause"}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          {/* Skip exercise button */}
          <TouchableOpacity style={styles.skipButton} onPress={skipExercise}>
            <Ionicons name="play-skip-forward" size={24} color="#9512af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer with overall workout progress */}
      <View style={styles.footer}>
        {/* Progress information text */}
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>
            {currentExercise + 1}/{workout.exercises.length}
          </Text>
        </View>
        {/* Overall workout progress bar */}
        <View style={styles.overallProgressContainer}>
          <View
            style={[
              styles.overallProgressBar,
              {
                // Calculate percentage of workout completed
                width: `${
                  ((currentExercise + 1) / workout.exercises.length) * 100
                }%`,
              },
            ]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Comprehensive styling for all workout session screens and components
const styles = StyleSheet.create({
  // Main container with light purple theme
  container: {
    flex: 1,
    backgroundColor: "#efdff1", // Light purple background
  },

  // Loading screen styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666", // Medium gray text
  },

  // Pre-workout overview screen styles
  preWorkoutContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9512af", // Brand purple color
    marginBottom: 8,
    textAlign: "center",
  },
  workoutDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 48, // Large spacing before exercise list
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Exercise list styles (pre-workout)
  exerciseList: {
    width: "100%",
    marginBottom: 48,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  exerciseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circular badge
    backgroundColor: "#f3e8f5", // Light purple background
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  exerciseNumberText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9512af",
  },
  exerciseDetails: {
    flex: 1, // Take remaining space
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  exerciseDuration: {
    fontSize: 14,
    color: "#666", // Secondary text color
  },

  // Start workout button
  startButton: {
    backgroundColor: "#9512af",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 25, // Rounded button
    width: "100%",
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Countdown screen styles
  countdownContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  readyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 72, // Very large countdown number
    fontWeight: "bold",
    color: "#9512af",
    marginBottom: 32,
  },
  nextExerciseText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },

  // Set information (used across multiple screens)
  setInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  setInfoText: {
    fontSize: 14,
    color: "#9512af",
    fontWeight: "600",
  },

  // Active workout screen header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Distribute space evenly
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  // Main workout content container
  workoutContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  // Exercise demonstration image/GIF
  exerciseImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 32,
  },

  // Exercise timer progress bar
  progressBarContainer: {
    width: "80%", // Responsive width
    height: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#9512af", // Brand color fill
    borderRadius: 8,
  },

  // Large timer text display
  timerText: {
    fontSize: 48, // Very large for visibility
    fontWeight: "bold",
    color: "#9512af",
    marginBottom: 16,
  },

  // Reps/time information
  repsInfo: {
    marginBottom: 32,
  },
  repsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // Control buttons container and individual button styles
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28, // Circular button
    backgroundColor: "#9512af",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "transparent", // Transparent background
    borderWidth: 2,
    borderColor: "#9512af", // Outline style
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer with overall progress
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  // Overall workout progress bar
  overallProgressContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "white",
    borderRadius: 4,
  },
  overallProgressBar: {
    height: "100%",
    backgroundColor: "#9512af",
    borderRadius: 4,
  },
});
