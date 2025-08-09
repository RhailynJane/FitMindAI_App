import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { firestoreService } from "../services/firestoreService";

interface WorkoutStats {
  duration: number;
  calories: number;
  exercises: number;
  workoutName: string;
  workoutCategory: string;
  startTime?: Date;
}

export default function WorkoutCompleteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Params:", params);
    console.log("User:", user);

    const loadWorkoutSession = async () => {
      if (!params.sessionId || !user?.uid) {
        setError("Missing session ID or user");
        return;
      }

      try {
        setIsLoading(true);

        // Add debug log
        console.log("Attempting to fetch session:", params.sessionId);

        // Use the new getWorkoutSession method
        const sessionId =
          typeof params.sessionId === "string"
            ? params.sessionId
            : params.sessionId?.[0];
        const session = await firestoreService.getWorkoutSession(
          sessionId,
          user.uid
        );

        if (!session) {
          console.error("Session not found in Firestore");
          setError("Workout session not found");
          return;
        }

        // Calculate duration
        const now = new Date();
        const startTime = session.startTime;
        const durationMinutes =
          (now.getTime() - startTime.getTime()) / (1000 * 60);

        setStats({
          duration: durationMinutes,
          calories: Math.round(durationMinutes * 10),
          exercises: session.workout?.exercises?.length || 0,
          workoutName: session.workout?.name || "Workout",
          workoutCategory: session.workout?.category || "General",
          startTime,
        });
      } catch (error) {
        console.error("Error loading workout session:", error);
        setError("Failed to load workout details");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkoutSession();
  }, [params.sessionId, user?.uid]);

  const completeWorkoutSession = async () => {
    if (!params.sessionId || !stats || !user?.uid || isSaved) return;

    try {
      setIsLoading(true);
      await firestoreService.completeWorkoutSession(
        typeof params.sessionId === "string"
          ? params.sessionId
          : params.sessionId[0],
        stats.duration
      );
      setIsSaved(true);

      // Optional: Show success message
      Alert.alert("Success", "Workout saved successfully!");
    } catch (error) {
      console.error("Error completing workout session:", error);
      Alert.alert(
        "Error",
        "Failed to save workout completion. Your stats are still recorded locally."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    if (!stats) return;

    try {
      const message = `I just completed ${stats.workoutName} (${
        stats.workoutCategory
      })!
⏱️ Duration: ${formatDuration(stats.duration)}
🔥 Calories burned: ${stats.calories}
💪 Exercises completed: ${stats.exercises}`;

      await Share.share({
        message,
        title: "My Workout Results",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9512af" />
          <Text style={styles.loadingText}>
            {error || "Loading your workout results..."}
          </Text>
          {error && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.push("/(tabs)/dashboard")}
            >
              <Text style={styles.retryButtonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/dashboard")}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.completedContainer}>
          <View style={styles.completedIconContainer}>
            <Ionicons
              name={isSaved ? "checkmark-circle" : "timer-outline"}
              size={80}
              color={isSaved ? "#9512af" : "#666"}
            />
            {isLoading && (
              <ActivityIndicator
                style={styles.loadingIndicator}
                size="small"
                color="#9512af"
              />
            )}
          </View>
          <Text style={styles.completedTitle}>
            {isLoading ? "Saving..." : "Workout Completed!"}
          </Text>
          <Text style={styles.completedSubtitle}>
            {stats.workoutName} ({stats.workoutCategory})
          </Text>
          {stats.startTime && (
            <Text style={styles.timeText}>
              {stats.startTime.toLocaleTimeString()} •{" "}
              {stats.startTime.toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color="#9512af" />
            <Text style={styles.statValue}>
              {formatDuration(stats.duration)}
            </Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={24} color="#9512af" />
            <Text style={styles.statValue}>{stats.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="fitness-outline" size={24} color="#9512af" />
            <Text style={styles.statValue}>{stats.exercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          disabled={isLoading}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.shareButtonText}>Share Results</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.doneButton, isLoading && styles.disabledButton]}
          onPress={async () => {
            await completeWorkoutSession();
            router.push("/(tabs)/dashboard");
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#9512af" />
          ) : (
            <Text style={styles.doneButtonText}>Done</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efdff1",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    alignItems: "flex-end",
  },
  completedContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 60,
  },
  completedIconContainer: {
    marginBottom: 24,
    position: "relative",
  },
  loadingIndicator: {
    position: "absolute",
    alignSelf: "center",
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  completedSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 60,
  },
  statItem: {
    alignItems: "center",
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  shareButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    opacity: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#9512af",
    borderRadius: 25,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  doneButtonText: {
    color: "#9512af",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#9512af",
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    textAlign: "center",
  },
});
