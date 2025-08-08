import { router } from "expo-router"; // Expo Router navigation
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// Define the structure of an exercise
interface Exercise {
  name: string;
  duration: number;
  image: string;
}

// Main functional component
const WorkoutScreen: React.FC = () => {
  // State for workout logic
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [exerciseTime, setExerciseTime] = useState(30);

  // Use ref to store timer ID for proper cleanup
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Temporary hardcoded workout data
  const workoutData = {
    title: "Morning Energizer",
    exercises: [
      {
        name: "Jumping Jacks",
        duration: 30,
        image: "https://via.placeholder.com/300x300",
      },
      {
        name: "Push-ups",
        duration: 30,
        image: "https://via.placeholder.com/300x300",
      },
      {
        name: "Squats",
        duration: 30,
        image: "https://via.placeholder.com/300x300",
      },
      {
        name: "Plank",
        duration: 30,
        image: "https://via.placeholder.com/300x300",
      },
    ] as Exercise[],
  };

  // Effect to handle countdown and exercise timer
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isStarted && !isPaused) {
      if (countdown > 0) {
        // Decrement countdown
        timerRef.current = setTimeout(
          () => setCountdown((prev) => prev - 1),
          1000
        );
      } else if (exerciseTime > 0) {
        // Decrement exercise time
        timerRef.current = setTimeout(
          () => setExerciseTime((prev) => prev - 1),
          1000
        );
      } else {
        // Move to next exercise or end workout
        if (currentExercise < workoutData.exercises.length - 1) {
          const nextIndex = currentExercise + 1;
          setCurrentExercise(nextIndex);
          setExerciseTime(workoutData.exercises[nextIndex].duration);
          setCountdown(3);
        } else {
          // Navigate to WorkoutComplete screen using Expo Router
          router.push("/workout-complete");
        }
      }
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    isStarted,
    isPaused,
    countdown,
    exerciseTime,
    currentExercise,
    workoutData.exercises,
  ]);

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Toggle pause/play
  const togglePause = () => setIsPaused((prev) => !prev);

  // Skip to next exercise or complete workout
  const skipExercise = () => {
    if (currentExercise < workoutData.exercises.length - 1) {
      const nextIndex = currentExercise + 1;
      setCurrentExercise(nextIndex);
      setExerciseTime(workoutData.exercises[nextIndex].duration);
      setCountdown(3);
    } else {
      router.push("/workout-complete");
    }
  };

  // Go back function with timer cleanup
  const handleGoBack = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    router.back(); // Expo Router back navigation
  };

  // Safe access to current exercise data
  const currentExerciseData = workoutData.exercises[currentExercise];
  if (!currentExerciseData) {
    return null;
  }

  // Render pre-workout screen
  if (!isStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.preWorkoutContainer}>
          <Text style={styles.workoutTitle}>{workoutData.title}</Text>
          <View style={styles.exerciseList}>
            {workoutData.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDuration}>
                    {exercise.duration} seconds
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

  // Render countdown before each exercise
  if (countdown > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.countdownContainer}>
          <Text style={styles.readyText}>READY TO GO!</Text>
          <Text style={styles.countdownText}>{countdown}</Text>
          <Text style={styles.nextExerciseText}>
            Get ready for {currentExerciseData.name}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render active workout screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentExerciseData.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.workoutContainer}>
        <Image
          source={{ uri: currentExerciseData.image }}
          style={styles.exerciseImage}
        />

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.max(
                  Math.min(
                    (exerciseTime / currentExerciseData.duration) * 100,
                    100
                  ),
                  0
                )}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.timerText}>{exerciseTime}</Text>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={togglePause}>
            <Icon
              name={isPaused ? "play-arrow" : "pause"}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={skipExercise}>
            <Icon name="skip-next" size={24} color="#9512af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer progress tracker */}
      <View style={styles.footer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>
            {currentExercise + 1}/{workoutData.exercises.length}
          </Text>
        </View>
        <View style={styles.overallProgressContainer}>
          <View
            style={[
              styles.overallProgressBar,
              {
                width: `${Math.min(
                  ((currentExercise + 1) / workoutData.exercises.length) * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efdff1",
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
    marginBottom: 48,
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
    marginBottom: 48,
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

export default WorkoutScreen;
