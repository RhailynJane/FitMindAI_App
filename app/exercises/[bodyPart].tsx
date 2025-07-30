"use client";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { exerciseApi, type Exercise } from "../../services/exerciseApi";

export default function ExercisesScreen() {
  const { bodyPart } = useLocalSearchParams<{ bodyPart: string }>();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bodyPart) {
      loadExercises();
    }
  }, [bodyPart]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      const exercisesData = await exerciseApi.getExercisesByBodyPart(
        decodeURIComponent(bodyPart),
        20
      );

      if (exercisesData.length === 0) {
        setError(`No exercises found for ${decodeURIComponent(bodyPart)}`);
        return;
      }

      setExercises(exercisesData);
    } catch (error: any) {
      console.error("Error loading exercises:", error);
      setError(error.message || "Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  const viewExerciseDetails = (exercise: Exercise) => {
    router.push(`/exercise-details/${exercise.id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {bodyPart
              ? decodeURIComponent(bodyPart).charAt(0).toUpperCase() +
                decodeURIComponent(bodyPart).slice(1)
              : "Exercises"}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9512af" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {bodyPart
              ? decodeURIComponent(bodyPart).charAt(0).toUpperCase() +
                decodeURIComponent(bodyPart).slice(1)
              : "Exercises"}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadExercises}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>
          {bodyPart
            ? decodeURIComponent(bodyPart).charAt(0).toUpperCase() +
              decodeURIComponent(bodyPart).slice(1)
            : "Exercises"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.exerciseCount}>
          {exercises.length} exercises found
        </Text>

        {exercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => viewExerciseDetails(exercise)}
          >
            <Image
              source={{ uri: exercise.gifUrl }}
              style={styles.exerciseImage}
              defaultSource={{
                uri: "https://via.placeholder.com/80x80/f0f0f0/999?text=Exercise",
              }}
            />
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseTarget}>
                Target: {exercise.target}
              </Text>
              <Text style={styles.exerciseEquipment}>
                Equipment: {exercise.equipment}
              </Text>
              <View style={styles.badgeContainer}>
                <View style={styles.bodyPartBadge}>
                  <Text style={styles.bodyPartText}>{exercise.bodyPart}</Text>
                </View>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>
                    {exercise.difficulty}
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  exerciseCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  exerciseCard: {
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
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  exerciseTarget: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 6,
  },
  bodyPartBadge: {
    backgroundColor: "#F3E8F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bodyPartText: {
    fontSize: 10,
    color: "#9512af",
    fontWeight: "500",
  },
  difficultyBadge: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "500",
  },
});
