"use client";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PlaceholderWorkoutImage from "../../components/PlaceholderWorkourImage";
import { useAuth } from "../../hooks/useAuth";
import { exerciseApi, type Exercise } from "../../services/exerciseApi";
import { firestoreService } from "../../services/firestoreService";

export default function ExerciseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToWorkout, setAddingToWorkout] = useState(false);

  useEffect(() => {
    if (id) {
      loadExercise();
    }
  }, [id]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const exerciseData = await exerciseApi.getExerciseById(id);
      setExercise(exerciseData);
    } catch (error) {
      console.error("Error loading exercise:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWorkout = async () => {
    if (!exercise || !user) return;

    try {
      setAddingToWorkout(true);

      // Create a custom workout with this exercise
      const workoutExercise = {
        exercise,
        sets: exercise.bodyPart === "cardio" ? 1 : 3,
        reps: exercise.bodyPart === "cardio" ? 0 : 12,
        duration: exercise.bodyPart === "cardio" ? 30 : undefined,
        restTime: 60,
      };

      const workout = {
        name: `${exercise.name} Workout`,
        exercises: [workoutExercise],
        isCustom: true,
        category: exercise.bodyPart,
      };

      await firestoreService.addWorkoutToUser(user.uid, workout);

      Alert.alert("Success!", "Exercise added to your workout plans!", [
        {
          text: "View Workouts",
          onPress: () => router.push("/(tabs)/workout-plans"),
        },
        {
          text: "OK",
          style: "default",
        },
      ]);
    } catch (error) {
      console.error("Error adding to workout:", error);
      Alert.alert(
        "Error",
        "Failed to add exercise to workout. Please try again."
      );
    } finally {
      setAddingToWorkout(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading exercise details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text>Exercise not found</Text>
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
        <Text style={styles.headerTitle}>Exercise Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Image */}
        <View style={styles.imageContainer}>
          {exercise.gifUrl ? (
            <Image
              source={{ uri: exercise.gifUrl }}
              style={styles.exerciseImage}
              defaultSource={{
                uri: "/placeholder.svg?height=300&width=300&text=Exercise",
              }}
            />
          ) : (
            <PlaceholderWorkoutImage exerciseName={exercise.name} size={300} />
          )}
        </View>

        {/* Exercise Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          <View style={styles.badgeContainer}>
            <View style={styles.bodyPartBadge}>
              <Text style={styles.bodyPartText}>{exercise.bodyPart}</Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{exercise.category}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="body-outline" size={20} color="#9512af" />
              <Text style={styles.detailLabel}>Target</Text>
              <Text style={styles.detailValue}>{exercise.target}</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="barbell-outline" size={20} color="#9512af" />
              <Text style={styles.detailLabel}>Equipment</Text>
              <Text style={styles.detailValue}>{exercise.equipment}</Text>
            </View>
          </View>

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

          {exercise.instructions && exercise.instructions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {exercise.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}

          {exercise.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{exercise.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Workout Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.addToWorkoutButton,
            addingToWorkout && styles.addToWorkoutButtonDisabled,
          ]}
          onPress={handleAddToWorkout}
          disabled={addingToWorkout}
        >
          {addingToWorkout ? (
            <Text style={styles.addToWorkoutButtonText}>Adding...</Text>
          ) : (
            <>
              <Ionicons
                name="add-circle-outline"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.addToWorkoutButtonText}>Add to Workout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 20,
  },
  exerciseImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  infoContainer: {
    backgroundColor: "white",
    marginTop: 8,
    padding: 20,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  bodyPartBadge: {
    backgroundColor: "#F3E8F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bodyPartText: {
    fontSize: 12,
    color: "#9512af",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  difficultyBadge: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  categoryBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  detailItem: {
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  musclesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  muscleTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  muscleText: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#9512af",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  bottomContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addToWorkoutButton: {
    backgroundColor: "#9512af",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  addToWorkoutButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addToWorkoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
