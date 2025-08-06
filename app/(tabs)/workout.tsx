"use client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ApiStatusChecker from "../../components/ApiStatusChecker";
import OfflineMessage from "../../components/OfflineMessage";
import { ApiOfflineError, exerciseApi } from "../../services/exerciseApi";

interface QuickWorkout {
  id: string;
  title: string;
  duration: string;
  level: string;
  color: string;
}

const bodyPartIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
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
  const [quickWorkouts, setQuickWorkouts] = useState<QuickWorkout[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();

  const defaultQuickWorkouts: QuickWorkout[] = [
    {
      id: "1",
      title: "Morning Energy Boost",
      duration: "15 min",
      level: "Beginner",
      color: "#FF6B9D",
    },
    {
      id: "2",
      title: "Quick HIIT Blast",
      duration: "12 min",
      level: "Intermediate",
      color: "#4ECDC4",
    },
    {
      id: "3",
      title: "Core Strength",
      duration: "20 min",
      level: "All Levels",
      color: "#45B7D1",
    },
  ];

  const defaultBodyParts = [
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

  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      setIsOffline(false);

      // Load quick workouts immediately
      setQuickWorkouts(defaultQuickWorkouts);
      console.log("Quick workouts loaded:", defaultQuickWorkouts.length);

      // Load body parts with fallback
      setBodyParts(defaultBodyParts);
      console.log("Body parts loaded:", defaultBodyParts.length);

      try {
        // Try to get real body parts from API
        const apiBodyParts = await exerciseApi.getBodyParts();
        if (apiBodyParts && apiBodyParts.length > 0) {
          setBodyParts(apiBodyParts);
          console.log("API body parts loaded:", apiBodyParts.length);
        }
      } catch (error) {
        if (error instanceof ApiOfflineError) {
          setIsOffline(true);
          console.log("API offline, using fallback body parts");
        } else {
          console.error("Error loading body parts:", error);
        }
      }
    } catch (error) {
      console.error("Error loading workout data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutData();
    setRefreshing(false);
  };

  const navigateToExercises = (bodyPart: string) => {
    console.log("Navigating to exercises for:", bodyPart);
    router.push(`/exercises/${encodeURIComponent(bodyPart)}`);
  };

  const startWorkout = (workoutId: string) => {
    router.push(`/workout/${workoutId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ApiStatusChecker
        onStatusChange={(isOnline: boolean) => setIsOffline(!isOnline)}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 100 : 80,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workouts</Text>
          <Text style={styles.headerSubtitle}>Choose your workout focus</Text>
        </View>

        {/* Quick Workouts */}
        <View style={styles.section}>
          <View style={styles.quickWorkoutCard}>
            <View style={styles.quickWorkoutHeader}>
              <Ionicons name="time-outline" size={20} color="#9512af" />
              <Text style={styles.quickWorkoutDuration}>20 min</Text>
              <Ionicons name="fitness-outline" size={20} color="#9512af" />
              <Text style={styles.quickWorkoutExercises}>2 exercises</Text>
            </View>
            <Text style={styles.quickWorkoutLevel}>All Levels</Text>
          </View>
        </View>

        {/* Offline Message */}
        {isOffline && <OfflineMessage />}

        {/* Body Parts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Body Part</Text>
          <Text style={styles.sectionSubtitle}>
            Select a muscle group to explore exercises
          </Text>

          <View style={styles.bodyPartsGrid}>
            {bodyParts.map((bodyPart) => (
              <TouchableOpacity
                key={bodyPart}
                style={styles.bodyPartCard}
                onPress={() => navigateToExercises(bodyPart)}
              >
                <View style={styles.bodyPartIcon}>
                  <Ionicons
                    name={bodyPartIcons[bodyPart] || "fitness-outline"}
                    size={24}
                    color="#9512af"
                  />
                </View>
                <Text style={styles.bodyPartName}>
                  {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                </Text>
                <Text style={styles.bodyPartSubtext}>
                  Explore {bodyPart} exercises
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#ccc"
                  style={styles.bodyPartArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickWorkoutCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickWorkoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  quickWorkoutDuration: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    marginRight: 16,
  },
  quickWorkoutExercises: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  quickWorkoutLevel: {
    fontSize: 12,
    color: "#9512af",
    backgroundColor: "#F3E8F5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  bodyPartsGrid: {
    gap: 16, // This adds proper spacing between cards
  },
  bodyPartCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bodyPartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3E8F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  bodyPartName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textTransform: "capitalize",
  },
  bodyPartSubtext: {
    fontSize: 12,
    color: "#666",
    position: "absolute",
    left: 80,
    bottom: 12,
  },
  bodyPartArrow: {
    marginLeft: 8,
  },
});
