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

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [exerciseTime, setExerciseTime] = useState(30);
  const [currentSet, setCurrentSet] = useState(1);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isStarted && !isPaused && workout) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else if (exerciseTime > 0) {
        timer = setTimeout(() => setExerciseTime(exerciseTime - 1), 1000);
      } else {
        // Move to next set or exercise
        const currentWorkoutExercise = workout.exercises[currentExercise];
        if (currentSet < currentWorkoutExercise.sets) {
          // Next set
          setCurrentSet(currentSet + 1);
          setExerciseTime(currentWorkoutExercise.duration || 30);
          setCountdown(3);
        } else if (currentExercise < workout.exercises.length - 1) {
          // Next exercise
          setCurrentExercise(currentExercise + 1);
          setCurrentSet(1);
          const nextExercise = workout.exercises[currentExercise + 1];
          setExerciseTime(nextExercise.duration || 30);
          setCountdown(3);
        } else {
          // Workout complete
          router.push("/workout-complete");
        }
      }
    }

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

  const loadWorkout = async () => {
    try {
      // Generate a sample workout for now
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

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const skipExercise = () => {
    if (!workout) return;

    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
      const nextExercise = workout.exercises[currentExercise + 1];
      setExerciseTime(nextExercise.duration || 30);
      setCountdown(3);
    } else {
      router.push("/workout-complete");
    }
  };

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentWorkoutExercise = workout.exercises[currentExercise];
  const currentExerciseData = currentWorkoutExercise.exercise;

  if (!isStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.preWorkoutContainer}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          <Text style={styles.workoutDescription}>{workout.description}</Text>

          <View style={styles.exerciseList}>
            {workout.exercises.map((workoutEx, index) => (
              <View key={index} style={styles.exerciseItem}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>
                    {workoutEx.exercise.name}
                  </Text>
                  <Text style={styles.exerciseDuration}>
                    {workoutEx.sets} sets ×{" "}
                    {workoutEx.reps || workoutEx.duration + "s"}
                  </Text>
                </View>
              </View>
            ))}
          </View>

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

  if (countdown > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.countdownContainer}>
          <Text style={styles.readyText}>READY TO GO!</Text>
          <Text style={styles.countdownText}>{countdown}</Text>
          <Text style={styles.nextExerciseText}>
            Get ready for {currentExerciseData.name}
          </Text>
          <Text style={styles.setInfo}>
            Set {currentSet} of {currentWorkoutExercise.sets}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentExerciseData.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.workoutContainer}>
        <Image
          source={{ uri: currentExerciseData.gifUrl }}
          style={styles.exerciseImage}
        />

        <View style={styles.setInfo}>
          <Text style={styles.setInfoText}>
            Set {currentSet} of {currentWorkoutExercise.sets}
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${
                  (exerciseTime / (currentWorkoutExercise.duration || 30)) * 100
                }%`,
              },
            ]}
          />
        </View>

        <Text style={styles.timerText}>{exerciseTime}</Text>

        <View style={styles.repsInfo}>
          <Text style={styles.repsText}>
            {currentWorkoutExercise.reps
              ? `${currentWorkoutExercise.reps} reps`
              : `${exerciseTime}s`}
          </Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={togglePause}>
            <Ionicons
              name={isPaused ? "play" : "pause"}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={skipExercise}>
            <Ionicons name="play-skip-forward" size={24} color="#9512af" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>
            {currentExercise + 1}/{workout.exercises.length}
          </Text>
        </View>
        <View style={styles.overallProgressContainer}>
          <View
            style={[
              styles.overallProgressBar,
              {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efdff1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
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
  setInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  setInfoText: {
    fontSize: 14,
    color: "#9512af",
    fontWeight: "600",
  },
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
  exerciseImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 32,
  },
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
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#9512af",
    marginBottom: 16,
  },
  repsInfo: {
    marginBottom: 32,
  },
  repsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
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
