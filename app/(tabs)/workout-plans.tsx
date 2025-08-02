import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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

export default function WorkoutPlansScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<UserWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user]);

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
              // Update local state immediately for better UX
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

  const startWorkout = async (workout: UserWorkout) => {
    if (!user) return;

    try {
      console.log("Starting workout:", workout.name);
      const sessionId = await firestoreService.startWorkoutSession(
        user.uid,
        workout.id,
        workout
      );
      router.push(`/workout-session/${sessionId}`);
    } catch (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Failed to start workout. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout Plans</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading your workouts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Plans</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/workout")}
        >
          <Ionicons name="add" size={24} color="#9512af" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 100 : 80,
        }}
      >
        {workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No workout plans yet</Text>
            <Text style={styles.emptyText}>
              Add exercises to create your first workout plan!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)/workout")}
            >
              <Text style={styles.browseButtonText}>Browse Exercises</Text>
            </TouchableOpacity>
          </View>
        ) : (
          workouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutCategory}>{workout.category}</Text>
                  <Text style={styles.workoutDetails}>
                    {workout.exercises.length} exercise
                    {workout.exercises.length !== 1 ? "s" : ""}
                    {workout.isCustom && " • Custom"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteWorkout(workout.id, workout.name)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.exercisesList}>
                {workout.exercises.slice(0, 3).map((workoutExercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>
                      {workoutExercise.exercise.name}
                    </Text>
                    <Text style={styles.exerciseDetails}>
                      {workoutExercise.sets} sets × {workoutExercise.reps} reps
                      {workoutExercise.duration &&
                        ` • ${workoutExercise.duration}s`}
                    </Text>
                  </View>
                ))}
                {workout.exercises.length > 3 && (
                  <Text style={styles.moreExercises}>
                    +{workout.exercises.length - 3} more exercise
                    {workout.exercises.length - 3 !== 1 ? "s" : ""}
                  </Text>
                )}
              </View>

              <View style={styles.workoutFooter}>
                <Text style={styles.lastUsed}>
                  {workout.lastUsed
                    ? `Last used: ${workout.lastUsed.toLocaleDateString()}`
                    : "Never used"}
                </Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => startWorkout(workout)}
                >
                  <Ionicons
                    name="play"
                    size={16}
                    color="white"
                    style={styles.startIcon}
                  />
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#9512af",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  workoutCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  workoutCategory: {
    fontSize: 12,
    color: "#9512af",
    backgroundColor: "#F3E8F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  workoutDetails: {
    fontSize: 12,
    color: "#666",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff5f5",
  },
  exercisesList: {
    marginBottom: 12,
  },
  exerciseItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 12,
    color: "#666",
  },
  moreExercises: {
    fontSize: 12,
    color: "#9512af",
    fontStyle: "italic",
    marginTop: 4,
  },
  workoutFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastUsed: {
    fontSize: 12,
    color: "#999",
  },
  startButton: {
    backgroundColor: "#9512af",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  startIcon: {
    marginRight: 4,
  },
  startButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
