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
    let isMounted = true;

    const loadWorkoutSession = async () => {
      try {
        if (!params.sessionId || !user?.uid) {
          if (isMounted) setError("Missing session ID or user");
          return;
        }

        if (isMounted) setIsLoading(true);

        const sessionId = 
          typeof params.sessionId === "string" 
            ? params.sessionId 
            : params.sessionId?.[0] || "";

        const session = await firestoreService.getWorkoutSession(
          sessionId,
          user.uid
        );

        if (!isMounted) return;

        if (!session) {
          setError("Workout session not found");
          return;
        }

        const now = new Date();
        const startTime = session.startTime;
        const durationMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);

        if (isMounted) {
          setStats({
            duration: durationMinutes,
            calories: Math.round(durationMinutes * 10),
            exercises: session.workout?.exercises?.length || 0,
            workoutName: session.workout?.name || "Custom Workout",
            workoutCategory: session.workout?.category || "General",
            startTime,
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading workout session:", error);
          setError("Failed to load workout details");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadWorkoutSession();

    return () => {
      isMounted = false;
    };
  }, [params.sessionId, user?.uid]);

  const completeWorkoutSession = async () => {
    if (!params.sessionId || !stats || !user?.uid || isSaved) return;

    try {
      setIsLoading(true);
      const sessionId = 
        typeof params.sessionId === "string" 
          ? params.sessionId 
          : params.sessionId?.[0] || "";
      
      await firestoreService.completeWorkoutSession(
        sessionId,
        stats.duration,
        user.uid
      );
      setIsSaved(true);
    } catch (error) {
      console.error("Error completing workout session:", error);
      Alert.alert(
        "Error", 
        "Failed to save workout. Your stats are still recorded locally."
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

  const handleDone = async () => {
    if (!isSaved) {
      await completeWorkoutSession();
    }
    router.replace({
      pathname: "/(tabs)/dashboard",
      params: { refresh: new Date().getTime() },
    });
  };

  if (error || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {error ? (
            <>
              <Ionicons name="warning-outline" size={48} color="#ff4444" />
              <Text style={styles.errorText}>{error}</Text>
            </>
          ) : (
            <ActivityIndicator size="large" color="#9512af" />
          )}
          <Text style={styles.loadingText}>
            {error ? "Couldn't load workout" : "Loading your results..."}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace("/(tabs)/dashboard")}
          >
            <Text style={styles.retryButtonText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleDone}
            disabled={isLoading}
          >
            <Ionicons 
              name="close" 
              size={24} 
              color={isLoading ? "#ccc" : "#333"} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.completedContainer}>
          <View style={styles.completedIconContainer}>
            <Ionicons
              name={isSaved ? "checkmark-circle" : "timer-outline"}
              size={80}
              color={isSaved ? "#4CAF50" : "#9512af"}
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
            {stats.workoutName} • {stats.workoutCategory}
          </Text>
          {stats.startTime && (
            <Text style={styles.timeText}>
              {stats.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{" "}
              {stats.startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={28} color="#9512af" />
            <Text style={styles.statValue}>
              {formatDuration(stats.duration)}
            </Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={28} color="#9512af" />
            <Text style={styles.statValue}>{stats.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="barbell-outline" size={28} color="#9512af" />
            <Text style={styles.statValue}>{stats.exercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.shareButton,
              isLoading && styles.disabledButton
            ]}
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
            style={[
              styles.doneButton,
              isLoading && styles.disabledButton
            ]}
            onPress={handleDone}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#9512af" />
            ) : (
              <Text style={styles.doneButtonText}>
                {isSaved ? "Return Home" : "Save & Finish"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f1f9",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  completedContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  completedIconContainer: {
    marginBottom: 20,
    position: "relative",
  },
  loadingIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  completedTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: 6,
    textAlign: "center",
  },
  completedSubtitle: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
    minWidth: 100,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d2d2d",
    marginVertical: 6,
  },
  statLabel: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 20,
  },
  shareButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#9512af",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
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
    padding: 30,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 10,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: "#9512af",
    borderRadius: 25,
    elevation: 2,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});