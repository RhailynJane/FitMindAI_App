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

export default function ExerciseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("12");
  const [duration, setDuration] = useState("");
  const [restTime, setRestTime] = useState("60");
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadExercise();
    }
  }, [id]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const exerciseData = await exerciseApi.getExerciseById(id!);
      setExercise(exerciseData);
      setWorkoutName(`${exerciseData.name} Workout`);

      // Get the proper GIF URL from the image endpoint
      try {
        const gifUrl = await exerciseApi.getExerciseGifUrl(id!);
        setGifUrl(gifUrl);
      } catch (imageError) {
        console.warn(
          "Failed to load exercise GIF, using default URL:",
          imageError
        );
        setGifUrl(exerciseData.gifUrl); // Fallback to the original gifUrl
      }
    } catch (error) {
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

  const handleAddToWorkout = async () => {
    if (!user || !exercise) {
      Alert.alert("Error", "Please sign in to add exercises to your workout.");
      return;
    }

    try {
      const workoutExercise = {
        exercise: {
          id: exercise.id,
          name: exercise.name,
          bodyPart: exercise.bodyPart,
          target: exercise.target,
          equipment: exercise.equipment,
          gifUrl: gifUrl || exercise.gifUrl, // Use the proper GIF URL
          instructions: exercise.instructions || [],
          secondaryMuscles: exercise.secondaryMuscles || [],
          difficulty: exercise.difficulty,
          category: exercise.category,
          description: exercise.description || "",
        },
        sets: Number.parseInt(sets) || 3,
        reps: Number.parseInt(reps) || 12,
        duration: duration ? Number.parseInt(duration) : null,
        restTime: Number.parseInt(restTime) || 60,
      };

      const workoutData = {
        name: workoutName || `${exercise.name} Workout`,
        exercises: [workoutExercise],
        isCustom: true,
        category: exercise.bodyPart,
      };

      await firestoreService.addWorkoutToUser(user.uid, workoutData);
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

  const handleViewPlans = () => {
    setShowSuccessModal(false);
    router.push("/(tabs)/workout-plans");
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
  };

  if (loading) {
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
          <Text>Loading exercise details...</Text>
        </View>
      </View>
    );
  }

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
          paddingBottom: Platform.OS === "ios" ? 120 : 100,
        }}
      >
        <View style={styles.imageContainer}>
          {gifUrl || exercise.gifUrl ? (
            <Image
              source={{ uri: gifUrl || exercise.gifUrl }}
              style={styles.exerciseImage}
              resizeMode="contain"
              onError={() => console.log("Failed to load exercise image")}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="fitness-outline" size={64} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exercise.bodyPart}</Text>
            </View>
            <View style={[styles.tag, styles.difficultyTag]}>
              <Text style={styles.tagText}>{exercise.difficulty}</Text>
            </View>
            <View style={[styles.tag, styles.categoryTag]}>
              <Text style={styles.tagText}>{exercise.category}</Text>
            </View>
          </View>

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

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.addButtonText}>Add to Workout</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Workout</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Workout Name</Text>
              <TextInput
                style={styles.textInput}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="Enter workout name"
              />
            </View>

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

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (sec)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="Optional"
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

      <Modal visible={showSuccessModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="white" />
            </View>
            <Text style={styles.successTitle}>Workout Added!</Text>
            <Text style={styles.successMessage}>
              &quot;{exercise.name}&quot; has been added to your workout plans.
            </Text>
            <View style={styles.successButtons}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
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
  },
  backButton: {
    marginRight: 16,
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
  },
  imageContainer: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
  },
  exerciseImage: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: 300,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
    textTransform: "capitalize",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 8,
  },
  tag: {
    backgroundColor: "#9512af",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyTag: {
    backgroundColor: "#4CAF50",
  },
  categoryTag: {
    backgroundColor: "#2196F3",
  },
  tagText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  detailsRow: {
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    color: "white",
    fontSize: 12,
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
  addButton: {
    backgroundColor: "#9512af",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#9512af",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  successModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  successButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  viewPlansButton: {
    flex: 1,
    backgroundColor: "#9512af",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  viewPlansButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
