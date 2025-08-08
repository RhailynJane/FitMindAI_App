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
 * A comprehensive workout session management screen that handles:
 * - Pre-workout overview and exercise list
 * - Countdown timer before each exercise/set
 * - Active workout timer with pause/resume functionality
 * - Set and exercise progression
 * - Overall workout progress tracking
 *
 * Route: Expects an 'id' parameter from the URL for workout identification
 */
export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Core workout data
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);

  // Workout session state management
  const [isStarted, setIsStarted] = useState(false); // Whether workout has begun
  const [isPaused, setIsPaused] = useState(false); // Pause/resume state
  const [currentExercise, setCurrentExercise] = useState(0); // Index of current exercise
  const [currentSet, setCurrentSet] = useState(1); // Current set number

  // Timer states
  const [countdown, setCountdown] = useState(3); // Pre-exercise countdown (3-2-1)
  const [exerciseTime, setExerciseTime] = useState(30); // Time remaining for current exercise

  // Load workout data when component mounts or ID changes
  useEffect(() => {
    loadWorkout();
  }, [id]);

  /**
   * Main timer effect - Handles all timing logic for the workout
   * Manages countdown, exercise timing, and progression between sets/exercises
   */
  useEffect(() => {
    let timer: number;

    // Only run timer when workout is active and not paused
    if (isStarted && !isPaused && workout) {
      if (countdown > 0) {
        // Pre-exercise countdown phase (3-2-1)
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else if (exerciseTime > 0) {
        // Active exercise timing phase
        timer = setTimeout(() => setExerciseTime(exerciseTime - 1), 1000);
      } else {
        // Exercise time completed - handle progression logic
        const currentWorkoutExercise = workout.exercises[currentExercise];

        if (currentSet < currentWorkoutExercise.sets) {
          // Move to next set of the same exercise
          setCurrentSet(currentSet + 1);
          setExerciseTime(currentWorkoutExercise.duration || 30);
          setCountdown(3); // Reset countdown for next set
        } else if (currentExercise < workout.exercises.length - 1) {
          // Move to next exercise (reset to set 1)
          setCurrentExercise(currentExercise + 1);
          setCurrentSet(1);
          const nextExercise = workout.exercises[currentExercise + 1];
          setExerciseTime(nextExercise.duration || 30);
          setCountdown(3); // Reset countdown for next exercise
        } else {
          // All exercises completed - navigate to completion screen
          router.push("/workout-complete");
        }
      }
    }

    // Cleanup timer on unmount or dependency change
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
   * Currently generates a sample workout - could be modified to load by ID
   */
  const loadWorkout = async () => {
    try {
      // Generate a sample workout for demonstration
      // In production, this would likely fetch by the provided ID
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
    }
  };

  /**
   * Toggles workout pause/resume state
   * Allows users to pause and resume their workout session
   */
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  /**
   * Skips the current exercise and moves to the next one
   * Resets set count and timers for the next exercise
   */
  const skipExercise = () => {
    if (!workout) return;

    if (currentExercise < workout.exercises.length - 1) {
      // Move to next exercise
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
      const nextExercise = workout.exercises[currentExercise + 1];
      setExerciseTime(nextExercise.duration || 30);
      setCountdown(3);
    } else {
      // Last exercise - complete workout
      router.push("/workout-complete");
    }
  };

  // Loading state - shown while workout data is being fetched
  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get current exercise data for easy access
  const currentWorkoutExercise = workout.exercises[currentExercise];
  const currentExerciseData = currentWorkoutExercise.exercise;

  /**
   * Pre-workout screen - Shows workout overview and exercise list
   * Displayed before user starts the actual workout session
   */
  if (!isStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.preWorkoutContainer}>
          {/* Workout title and description */}
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          <Text style={styles.workoutDescription}>{workout.description}</Text>

          {/* List of exercises in the workout */}
          <View style={styles.exerciseList}>
            {workout.exercises.map((workoutEx, index) => (
              <View key={index} style={styles.exerciseItem}>
                {/* Exercise number badge */}
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                {/* Exercise details */}
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>
                    {workoutEx.exercise.name}
                  </Text>
                  {/* Sets and reps/duration information */}
                  <Text style={styles.exerciseDuration}>
                    {workoutEx.sets} sets ×{" "}
                    {workoutEx.reps || workoutEx.duration + "s"}
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
   * Countdown screen - Shows 3-2-1 countdown before each exercise/set
   * Gives users time to prepare for the next exercise
   */
  if (countdown > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.countdownContainer}>
          <Text style={styles.readyText}>READY TO GO!</Text>
          {/* Large countdown number */}
          <Text style={styles.countdownText}>{countdown}</Text>
          {/* Next exercise name */}
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
   * Active workout screen - Main exercise interface
   * Shows exercise GIF, timer, progress, and controls
   */
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button and exercise name */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentExerciseData.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main workout content */}
      <View style={styles.workoutContainer}>
        {/* Exercise demonstration GIF */}
        <Image
          source={{ uri: currentExerciseData.gifUrl }}
          style={styles.exerciseImage}
        />

        {/* Current set information */}
        <View style={styles.setInfo}>
          <Text style={styles.setInfoText}>
            Set {currentSet} of {currentWorkoutExercise.sets}
          </Text>
        </View>

        {/* Exercise time progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                // Calculate progress percentage based on remaining time
                width: `${
                  (exerciseTime / (currentWorkoutExercise.duration || 30)) * 100
                }%`,
              },
            ]}
          />
        </View>

        {/* Large timer display */}
        <Text style={styles.timerText}>{exerciseTime}</Text>

        {/* Reps or time information */}
        <View style={styles.repsInfo}>
          <Text style={styles.repsText}>
            {currentWorkoutExercise.reps
              ? `${currentWorkoutExercise.reps} reps`
              : `${exerciseTime}s`}
          </Text>
        </View>

        {/* Control buttons - pause/resume and skip */}
        <View style={styles.controlsContainer}>
          {/* Pause/Resume button */}
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
        {/* Progress text */}
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>
            {currentExercise + 1}/{workout.exercises.length}
          </Text>
        </View>
        {/* Overall progress bar */}
        <View style={styles.overallProgressContainer}>
          <View
            style={[
              styles.overallProgressBar,
              {
                // Calculate overall workout progress
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

// Comprehensive styling for all workout session states and components
const styles = StyleSheet.create({
  // Main container with light purple background
  container: {
    flex: 1,
    backgroundColor: "#efdff1",
  },

  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },

  // Pre-workout overview styles
  preWorkoutContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9512af",
    marginBottom: 8,
    textAlign: "center",
  },
  workoutDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 48,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Exercise list styles for pre-workout overview
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
    borderRadius: 20,
    backgroundColor: "#f3e8f5",
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
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  exerciseDuration: {
    fontSize: 14,
    color: "#666",
  },

  // Start workout button
  startButton: {
    backgroundColor: "#9512af",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 25,
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
    fontSize: 72,
    fontWeight: "bold",
    color: "#9512af",
    marginBottom: 32,
  },
  nextExerciseText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },

  // Set information styles (used in multiple screens)
  setInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  setInfoText: {
    fontSize: 14,
    color: "#9512af",
    fontWeight: "600",
  },

  // Active workout screen styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  workoutContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  // Exercise demonstration image
  exerciseImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 32,
  },

  // Progress bar for individual exercise timing
  progressBarContainer: {
    width: "80%",
    height: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#9512af",
    borderRadius: 8,
  },

  // Large timer display
  timerText: {
    fontSize: 48,
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

  // Control buttons container and styles
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#9512af",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#9512af",
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
