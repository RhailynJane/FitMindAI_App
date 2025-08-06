"use client";
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
  const [activeTab, setActiveTab] = useState<"start" | "myPlans">("start");

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

  const handleAICoachRecommendation = () => {
    router.push("/ai-chat");
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Ionicons name="menu" size={24} color="#333" />
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
        <Ionicons name="menu" size={24} color="#333" />
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
        {/* AI Coach Recommendations */}
        <LinearGradient
          colors={["#F8E8FF", "#E8D5FF"]}
          style={styles.aiCoachCard}
        >
          <View style={styles.aiCoachContent}>
            <View style={styles.aiCoachText}>
              <Text style={styles.aiCoachTitle}>AI Coach Recommendations</Text>
              <Text style={styles.aiCoachDescription}>
                Based on your fitness level and goals, the AI recommends this
                plan is perfect for you. It combines strength and cardio for
                optimal results.
              </Text>
              <TouchableOpacity
                style={styles.aiCoachButton}
                onPress={handleAICoachRecommendation}
              >
                <Text style={styles.aiCoachButtonText}>
                  Start Recommended Plan
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.aiCoachIllustration}>
              <View style={styles.personIllustration}>
                <View style={styles.personHead} />
                <View style={styles.personBody} />
                <View style={styles.personArm} />
                <View style={[styles.personArm, styles.personArmRight]} />
                <View style={styles.personLeg} />
                <View style={[styles.personLeg, styles.personLegRight]} />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "start" && styles.activeTab]}
            onPress={() => setActiveTab("start")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "start" && styles.activeTabText,
              ]}
            >
              Start
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "myPlans" && styles.activeTab]}
            onPress={() => setActiveTab("myPlans")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "myPlans" && styles.activeTabText,
              ]}
            >
              My Plans ({workouts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "start" ? (
          <View>
            {/* Featured Workout Card */}
            <LinearGradient
              colors={["#FF6B9D", "#C44CAE"]}
              style={styles.featuredCard}
            >
              <View style={styles.featuredContent}>
                <View style={styles.featuredText}>
                  <Text style={styles.featuredTitle}>Balance Boost</Text>
                  <Text style={styles.featuredDescription}>
                    Gentle yoga, along with strength training
                  </Text>
                </View>
                <View style={styles.featuredIllustration}>
                  <View style={styles.yogaPersonContainer}>
                    <View style={styles.yogaPerson}>
                      <View style={styles.yogaHead} />
                      <View style={styles.yogaBody} />
                      <View style={styles.yogaArm} />
                      <View style={[styles.yogaArm, styles.yogaArmRight]} />
                      <View style={styles.yogaLeg} />
                      <View style={[styles.yogaLeg, styles.yogaLegRight]} />
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>50</Text>
                  <Text style={styles.statLabel}>days</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>35</Text>
                  <Text style={styles.statLabel}>workouts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10,000</Text>
                  <Text style={styles.statLabel}>points</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.startPlanButton}>
                <Text style={styles.startPlanButtonText}>Start Plan</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Transformation Challenge */}
            <LinearGradient
              colors={["#FF6B9D", "#C44CAE"]}
              style={styles.transformationCard}
            >
              <Text style={styles.transformationTitle}>
                30 days Transformation
              </Text>
              <Text style={styles.transformationSubtitle}>
                Complete body Transformation with
              </Text>
            </LinearGradient>
          </View>
        ) : (
          <View>
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
                        {workout.exercises.length} exercise
                        {workout.exercises.length !== 1 ? "s" : ""} for{" "}
                        {workout.category}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDeleteWorkout(workout.id, workout.name)
                      }
                    >
                      <Ionicons name="trash-outline" size={20} color="white" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>48% complete</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: "48%" }]} />
                    </View>
                  </View>

                  <View style={styles.workoutStatsContainer}>
                    <View style={styles.workoutStatItem}>
                      <Text style={styles.workoutStatNumber}>30</Text>
                      <Text style={styles.workoutStatLabel}>days</Text>
                    </View>
                    <View style={styles.workoutStatItem}>
                      <Text style={styles.workoutStatNumber}>24</Text>
                      <Text style={styles.workoutStatLabel}>workouts</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => startWorkout(workout)}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </LinearGradient>
              ))
            )}
          </View>
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
  aiCoachIllustration: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  personIllustration: {
    position: "relative",
  },
  personHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFB6C1",
    marginBottom: 2,
  },
  personBody: {
    width: 16,
    height: 25,
    backgroundColor: "#FF69B4",
    borderRadius: 8,
    marginBottom: 2,
  },
  personArm: {
    position: "absolute",
    width: 3,
    height: 15,
    backgroundColor: "#FFB6C1",
    borderRadius: 2,
    top: 22,
    left: -5,
    transform: [{ rotate: "-30deg" }],
  },
  personArmRight: {
    left: 18,
    transform: [{ rotate: "30deg" }],
  },
  personLeg: {
    width: 4,
    height: 20,
    backgroundColor: "#333",
    borderRadius: 2,
    marginLeft: 2,
  },
  personLegRight: {
    marginLeft: 10,
    marginTop: -20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#333",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "white",
  },
  featuredCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  featuredContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  featuredText: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  featuredIllustration: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  yogaPersonContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  yogaPerson: {
    position: "relative",
  },
  yogaHead: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFB6C1",
    marginBottom: 2,
  },
  yogaBody: {
    width: 12,
    height: 20,
    backgroundColor: "white",
    borderRadius: 6,
    marginBottom: 2,
  },
  yogaArm: {
    position: "absolute",
    width: 2,
    height: 12,
    backgroundColor: "#FFB6C1",
    borderRadius: 1,
    top: 18,
    left: -4,
    transform: [{ rotate: "-45deg" }],
  },
  yogaArmRight: {
    left: 14,
    transform: [{ rotate: "45deg" }],
  },
  yogaLeg: {
    width: 3,
    height: 15,
    backgroundColor: "#333",
    borderRadius: 2,
    marginLeft: 1,
    transform: [{ rotate: "-20deg" }],
  },
  yogaLegRight: {
    marginLeft: 8,
    marginTop: -15,
    transform: [{ rotate: "20deg" }],
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  startPlanButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  startPlanButtonText: {
    color: "#9512af",
    fontSize: 16,
    fontWeight: "600",
  },
  transformationCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  transformationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  transformationSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
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
