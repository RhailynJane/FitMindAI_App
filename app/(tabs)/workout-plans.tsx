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

const { width } = Dimensions.get("window");

export default function WorkoutPlansScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [workouts, setWorkouts] = useState<UserWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [startedWorkouts, setStartedWorkouts] = useState<Set<string>>(
    new Set()
  );
  const [completedWorkouts, setCompletedWorkouts] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (user) {
      loadWorkouts();
      // Load completed workouts from storage if needed
    }
  }, [user]);

  const loadWorkouts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userWorkouts = await firestoreService.getUserWorkouts(user.uid);
      setWorkouts(userWorkouts);

      // Here you could load completed workouts from AsyncStorage or your database
      // For example:
      // const completed = await firestoreService.getCompletedWorkouts(user.uid);
      // setCompletedWorkouts(new Set(completed));

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
              setWorkouts((prevWorkouts) =>
                prevWorkouts.filter((w) => w.id !== workoutId)
              );
              // Remove from started and completed sets if present
              setStartedWorkouts((prev) => {
                const newSet = new Set(prev);
                newSet.delete(workoutId);
                return newSet;
              });
              setCompletedWorkouts((prev) => {
                const newSet = new Set(prev);
                newSet.delete(workoutId);
                return newSet;
              });
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

  const handleStartWorkout = async (workout: UserWorkout) => {
    if (!user) return;

    // If workout is already completed, don't show start dialog
    if (completedWorkouts.has(workout.id)) {
      return;
    }

    Alert.alert("Start Workout", `Are you ready to start "${workout.name}"?`, [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          // Mark this workout as started (but not completed)
          setStartedWorkouts((prev) => new Set(prev).add(workout.id));
        },
      },
      {
        text: "Start",
        onPress: () => startWorkout(workout),
      },
    ]);
  };

  const startWorkout = async (workout: UserWorkout) => {
    try {
      console.log("Starting workout:", workout.name);
      if (!user?.uid) {
        Alert.alert("Error", "User not authenticated.");
        return;
      }
      const sessionId = await firestoreService.startWorkoutSession(
        user.uid,
        workout.id,
        workout
      );
      router.push({
        pathname: "/workout/[workoutId]",
        params: {
          workoutId: workout.id,
          sessionId,
        },
      });
    } catch (error) {
      console.error("Error starting workout:", error);
      Alert.alert("Error", "Failed to start workout. Please try again.");
    }
  };

  const markWorkoutComplete = (workoutId: string) => {
    setCompletedWorkouts((prev) => new Set(prev).add(workoutId));
    // You might want to save this to AsyncStorage or your database here
  };

  const getButtonText = (workoutId: string) => {
    if (completedWorkouts.has(workoutId)) {
      return "Done";
    } else if (startedWorkouts.has(workoutId)) {
      return "Continue";
    } else {
      return "Start Plan";
    }
  };

  const getButtonStyle = (workoutId: string) => {
    if (completedWorkouts.has(workoutId)) {
      return [styles.continueButton, styles.completedButton];
    }
    return styles.continueButton;
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Plans</Text>
        <View style={{ width: 24 }} />
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
          workouts.map((workout, index) => (
            <LinearGradient
              key={workout.id}
              colors={
                index % 2 === 0
                  ? ["#FF6B9D", "#C44CAE"]
                  : ["#6B73FF", "#4E54C8"]
              }
              style={styles.workoutCard}
            >
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDescription}>
                    {`${workout.exercises.length} exercise${
                      workout.exercises.length !== 1 ? "s" : ""
                    } for ${workout.category}`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteWorkout(workout.id, workout.name)}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={getButtonStyle(workout.id)}
                onPress={() => handleStartWorkout(workout)}
                disabled={completedWorkouts.has(workout.id)}
              >
                <Text style={styles.continueButtonText}>
                  {getButtonText(workout.id)}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
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
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
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
  completedButton: {
    backgroundColor: "#4CAF50",
  },
  aiCoachCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  aiCoachContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiCoachText: {
    flex: 1,
    paddingRight: 15,
  },
  aiCoachTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  aiCoachDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    marginBottom: 15,
  },
  aiCoachButton: {
    backgroundColor: "#9512af",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  aiCoachButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
    textAlign: "right",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  workoutStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  workoutStatItem: {
    alignItems: "center",
  },
  workoutStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  workoutStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  continueButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#9512af",
    fontSize: 16,
    fontWeight: "600",
  },
});
