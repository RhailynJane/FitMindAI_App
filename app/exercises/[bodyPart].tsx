import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OfflineMessage from "../../components/OfflineMessage";
import {
  ApiOfflineError,
  exerciseApi,
  type Exercise,
} from "../../services/exerciseApi";

export default function ExercisesByBodyPart() {
  const { bodyPart } = useLocalSearchParams<{ bodyPart: string }>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState("");

  useEffect(() => {
    loadExercises();
  }, [bodyPart]);

  const loadExercises = async () => {
    if (!bodyPart) return;

    try {
      setLoading(true);
      setIsOffline(false);
      const data = await exerciseApi.getExercisesByBodyPart(bodyPart);
      setExercises(data);
    } catch (error) {
      if (error instanceof ApiOfflineError) {
        setIsOffline(true);
        setOfflineMessage(error.message);
      } else {
        setIsOffline(true);
        setOfflineMessage(
          "Exercise database is currently offline. We're working to restore the service."
        );
      }
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExercisePress = (exercise: Exercise) => {
    router.push(`/exercise-details/${exercise.id}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9512af" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isOffline) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercises</Text>
          <View style={styles.placeholder} />
        </View>
        <OfflineMessage
          title="Exercise Database Offline"
          message={offlineMessage}
        />
      </SafeAreaView>
    );
  }

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleExercisePress(item)}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseTarget}>Target: {item.target}</Text>
        <Text style={styles.exerciseEquipment}>
          Equipment: {item.equipment}
        </Text>
        <View style={styles.badgeContainer}>
          <View style={styles.bodyPartBadge}>
            <Text style={styles.bodyPartText}>{item.bodyPart}</Text>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "#4CAF50";
      case "intermediate":
        return "#FF9800";
      case "advanced":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {bodyPart
            ? bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)
            : "Exercises"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.exerciseCount}>
          {exercises.length} exercises found
        </Text>
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 32,
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
  content: {
    flex: 1,
  },
  exerciseCount: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    textTransform: "capitalize",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    color: "white",
    fontWeight: "500",
  },
});
