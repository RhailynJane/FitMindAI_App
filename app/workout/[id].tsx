"use client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import {
  useAuthFunctions,
  type UserProfile,
} from "../../hooks/useAuthFunctions";

interface Workout {
  id: string;
  title: string;
  duration: string;
  level: string;
  image: any;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { logout, getUserProfile } = useAuthFunctions();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const workouts: Workout[] = [
    {
      id: "1",
      title: "Morning Energizer",
      duration: "15 min",
      level: "Beginner",
      image: require("../../assets/images/workouts/morning-energizer.png"),
    },
    {
      id: "2",
      title: "Full Body Strength",
      duration: "30 min",
      level: "Intermediate",
      image: require("../../assets/images/workouts/full-body.png"),
    },
    {
      id: "3",
      title: "Cardio Blast",
      duration: "20 min",
      level: "All Levels",
      image: require("../../assets/images/workouts/cardio.png"),
    },
    {
      id: "4",
      title: "Mindful Yoga",
      duration: "25 min",
      level: "All Levels",
      image: require("../../assets/images/workouts/yoga.png"),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const startWorkout = (workoutId: string) => {
    router.push(`/workout/${workoutId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome,{" "}
              {userProfile?.firstName ||
                user?.displayName?.split(" ")[0] ||
                "User"}
              !
            </Text>
            <Text style={styles.subText}>
              Let's achieve your fitness goals today
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#9512af" />
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View>
              <Text style={styles.activityTitle}>Today's Activity</Text>
              <Text style={styles.activityDate}>
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsValue}>250</Text>
              <Text style={styles.pointsLabel}>points earned</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="fitness-outline" size={20} color="#9512af" />
              </View>
              <Text style={styles.statText}>2 workouts</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="time-outline" size={20} color="#9512af" />
              </View>
              <Text style={styles.statText}>45 minutes</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="flame-outline" size={20} color="#9512af" />
              </View>
              <Text style={styles.statText}>120 cal</Text>
            </View>
          </View>
        </View>

        <View style={styles.workoutsSection}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>

          {workouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <Image source={workout.image} style={styles.workoutImage} />
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <View style={styles.workoutMeta}>
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text style={styles.workoutMetaText}>{workout.duration}</Text>
                  <Text style={styles.workoutMetaText}>• {workout.level}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => startWorkout(workout.id)}
              >
                <Ionicons name="play" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
  },
  header: {
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9512af",
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    color: "#666",
  },
  logoutButton: {
    padding: 8,
  },
  activityCard: {
    backgroundColor: "white",
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  activityDate: {
    fontSize: 12,
    color: "#666",
  },
  pointsContainer: {
    alignItems: "flex-end",
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9512af",
  },
  pointsLabel: {
    fontSize: 10,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3e8f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  workoutsSection: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  workoutInfo: {
    flex: 1,
    padding: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  workoutMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutMetaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#9512af",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
});
