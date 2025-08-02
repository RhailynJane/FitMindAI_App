"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiOfflineError, exerciseApi } from "../../services/exerciseApi";
import {
  workoutGenerator,
  type GeneratedWorkout,
} from "../../services/workoutGenerator";

const FALLBACK_BODY_PARTS = [
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
];

const BODY_PART_ICONS: { [key: string]: string } = {
  back: "body-outline",
  cardio: "heart-outline",
  chest: "fitness-outline",
  "lower arms": "hand-left-outline",
  "lower legs": "walk-outline",
  neck: "person-outline",
  shoulders: "body-outline",
  "upper arms": "barbell-outline",
  "upper legs": "walk-outline",
  waist: "body-outline",
};

export default function WorkoutScreen() {
  const router = useRouter();
  const [bodyParts, setBodyParts] = useState<string[]>(FALLBACK_BODY_PARTS);
  const [quickWorkouts, setQuickWorkouts] = useState<GeneratedWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setIsOffline(false);

      console.log("Loading workout data...");

      // Always load quick workouts first (they don't depend on API)
      const quickWorkoutsData = await workoutGenerator.getQuickWorkouts();
      setQuickWorkouts(quickWorkoutsData);
      console.log("Quick workouts loaded:", quickWorkoutsData.length);

      // Then try to load body parts from API
      try {
        const bodyPartsData = await exerciseApi.getBodyParts();
        setBodyParts(bodyPartsData);
        setApiOnline(true);
        console.log("Body parts loaded:", bodyPartsData.length);
      } catch (apiError) {
        console.log("API error, using fallback body parts:", apiError);
        setBodyParts(FALLBACK_BODY_PARTS);
        setApiOnline(false);

        if (apiError instanceof ApiOfflineError) {
          setOfflineMessage(apiError.message);
        }
      }
    } catch (error: any) {
      console.error("Error loading workout data:", error);
      if (error instanceof ApiOfflineError) {
        setIsOffline(true);
        setOfflineMessage(error.message);
      } else {
        setBodyParts(FALLBACK_BODY_PARTS);
        setApiOnline(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadWorkoutData(true);
  };

  const navigateToExercises = (bodyPart: string) => {
    console.log("Navigating to exercises for:", bodyPart);
    router.push(`/exercises/${encodeURIComponent(bodyPart)}`);
  };

  const startWorkout = (workout: GeneratedWorkout) => {
    console.log("Starting workout:", workout.name);
    router.push(`/workout-session/${workout.id}`);
  };

  const getBodyPartIcon = (
    bodyPart: string
  ): keyof typeof Ionicons.glyphMap => {
    return (BODY_PART_ICONS[bodyPart.toLowerCase()] ||
      "fitness-outline") as keyof typeof Ionicons.glyphMap;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workouts</Text>
        <Text style={styles.headerSubtitle}>Choose your workout focus</Text>
      </View>

      {isOffline && (
        <View style={styles.offlineNotice}>
          <Ionicons name="cloud-offline-outline" size={16} color="#FF6B6B" />
          <Text style={styles.offlineText}>Using offline data</Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9512af"]}
            tintColor="#9512af"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {loading && bodyParts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9512af" />
            <Text style={styles.loadingText}>Loading workouts...</Text>
          </View>
        ) : (
          <>
            {/* Quick Workouts Section */}
            {quickWorkouts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Workouts</Text>
                <View style={styles.quickWorkoutsContainer}>
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
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color="#666"
                            />
                            <Text style={styles.metaText}>
                              {workout.duration} min
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons
                              name="fitness-outline"
                              size={14}
                              color="#666"
                            />
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
              </View>
            )}

            {/* Body Parts Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by Body Part</Text>
              <Text style={styles.sectionSubtitle}>
                {apiOnline
                  ? "Select a muscle group to explore exercises"
                  : "Exercises available offline"}
              </Text>

              <View style={styles.bodyPartsGrid}>
                {bodyParts.map((bodyPart, index) => (
                  <TouchableOpacity
                    key={`${bodyPart}-${index}`}
                    style={styles.bodyPartCard}
                    onPress={() => navigateToExercises(bodyPart)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.bodyPartIcon}>
                      <Ionicons
                        name={getBodyPartIcon(bodyPart)}
                        size={24}
                        color="#9512af"
                      />
                    </View>
                    <View style={styles.bodyPartInfo}>
                      <Text style={styles.bodyPartName}>
                        {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                      </Text>
                      <Text style={styles.bodyPartDescription}>
                        Explore {bodyPart} exercises
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  offlineNotice: {
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE5E5",
  },
  offlineText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding for the tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  quickWorkoutsContainer: {
    gap: 16,
  },
  workoutCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutInfo: {
    flex: 1,
    marginRight: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  workoutDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  workoutMeta: {
    flexDirection: "row",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  difficultyBadge: {
    backgroundColor: "#F3E8F5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  difficultyText: {
    fontSize: 12,
    color: "#9512af",
    fontWeight: "600",
  },
  bodyPartsGrid: {
    gap: 16, // This adds proper spacing between cards
  },
  bodyPartCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bodyPartIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3E8F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  bodyPartInfo: {
    flex: 1,
  },
  bodyPartName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  bodyPartDescription: {
    fontSize: 14,
    color: "#666",
  },
});
