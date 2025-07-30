"use client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ApiStatusChecker from "../../components/ApiStatusChecker";
import { exerciseApi } from "../../services/exerciseApi";
import {
  workoutGenerator,
  type GeneratedWorkout,
} from "../../services/workoutGenerator";

export default function WorkoutScreen() {
  const router = useRouter();
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [quickWorkouts, setQuickWorkouts] = useState<GeneratedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load body parts and quick workouts in parallel
      const [bodyPartsData, quickWorkoutsData] = await Promise.all([
        exerciseApi.getBodyParts(),
        workoutGenerator.getQuickWorkouts(),
      ]);

      setBodyParts(bodyPartsData);
      setQuickWorkouts(quickWorkoutsData);
    } catch (error: any) {
      console.error("Error loading workout data:", error);
      setError(error.message || "Failed to load workout data");
    } finally {
      setLoading(false);
    }
  };

  const navigateToExercises = (bodyPart: string) => {
    if (!apiOnline) {
      alert(
        "ExerciseDB API is not available. Please check your connection and API key."
      );
      return;
    }
    router.push(`/exercises/${encodeURIComponent(bodyPart)}`);
  };

  const startWorkout = (workout: GeneratedWorkout) => {
    router.push(`/workout-session/${workout.id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workouts</Text>
        </View>
        <ApiStatusChecker onStatusChange={setApiOnline} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9512af" />
          <Text style={styles.loadingText}>Loading workouts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workouts</Text>
        </View>
        <ApiStatusChecker onStatusChange={setApiOnline} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadWorkoutData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workouts</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ApiStatusChecker onStatusChange={setApiOnline} />

        {/* Quick Workouts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Workouts</Text>
          {quickWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => startWorkout(workout)}
            >
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>{workout.name}</Text>
                <Text style={styles.workoutDescription}>
                  {workout.description}
                </Text>
                <View style={styles.workoutMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.metaText}>{workout.duration} min</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="fitness-outline" size={14} color="#666" />
                    <Text style={styles.metaText}>
                      {workout.exercises.length} exercises
                    </Text>
                  </View>
                </View>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>
                    {workout.difficulty}
                  </Text>
                </View>
              </View>
              <Ionicons name="play-circle" size={40} color="#9512af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Body Parts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Body Part</Text>
          {bodyParts.map((bodyPart) => (
            <TouchableOpacity
              key={bodyPart}
              style={[styles.categoryCard, !apiOnline && styles.disabledCard]}
              onPress={() => navigateToExercises(bodyPart)}
              disabled={!apiOnline}
            >
              <View style={styles.categoryInfo}>
                <Text
                  style={[
                    styles.categoryTitle,
                    !apiOnline && styles.disabledText,
                  ]}
                >
                  {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                </Text>
                <Text
                  style={[
                    styles.categorySubtitle,
                    !apiOnline && styles.disabledText,
                  ]}
                >
                  Explore {bodyPart} exercises
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={apiOnline ? "#666" : "#ccc"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#9512af",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutInfo: {
    flex: 1,
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: "row",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  difficultyBadge: {
    backgroundColor: "#F3E8F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  difficultyText: {
    fontSize: 10,
    color: "#9512af",
    fontWeight: "500",
  },
  categoryCard: {
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
  disabledCard: {
    opacity: 0.5,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 12,
    color: "#666",
  },
  disabledText: {
    color: "#ccc",
  },
});
