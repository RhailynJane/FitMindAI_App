import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import {
  useAuthFunctions,
  type UserProfile,
} from "../../hooks/useAuthFunctions";
import {
  firestoreService,
  type UserChallenge,
  type UserStats,
} from "../../services/firestoreService";

const { width } = Dimensions.get("window");

interface QuickWorkout {
  id: string;
  title: string;
  duration: string;
  level: string;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { logout, getUserProfile } = useAuthFunctions();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Fetch user profile
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);

          // Initialize user stats if they don't exist
          let stats = await firestoreService.getUserStats(user.uid);
          if (!stats) {
            await firestoreService.initializeUserStats(user.uid);
            stats = await firestoreService.getUserStats(user.uid);
          }
          setUserStats(stats);

          // Fetch user challenges
          const challenges = await firestoreService.getUserChallenges(user.uid);
          setUserChallenges(challenges);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Set up real-time listeners for stats updates
  useEffect(() => {
    if (!user) return;

    const unsubscribeStats = firestoreService.subscribeToUserStats(
      user.uid,
      (stats) => {
        setUserStats(stats);
      }
    );

    const unsubscribeChallenges = firestoreService.subscribeToUserChallenges(
      user.uid,
      (challenges) => {
        setUserChallenges(challenges);
      }
    );

    return () => {
      unsubscribeStats();
      unsubscribeChallenges();
    };
  }, [user]);

  const quickWorkouts: QuickWorkout[] = [
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

  const getUserName = () => {
    if (userProfile?.firstName) {
      return userProfile.firstName;
    }
    if (user?.displayName) {
      return user.displayName.split(" ")[0];
    }
    return "User";
  };

  const getActiveChallenge = () => {
    return userChallenges.find(
      (challenge) => !challenge.completed && new Date() <= challenge.endDate
    );
  };

  const activeChallenge = getActiveChallenge();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 100 : 80,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#9512af" />
          </TouchableOpacity>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={["#E8D5F2", "#F3E8F5"]}
            style={styles.welcomeGradient}
          >
            <Text style={styles.welcomeTitle}>Welcome, {getUserName()}!</Text>
            <Text style={styles.welcomeSubtitle}>
              Another day, another chance to become stronger.
            </Text>
          </LinearGradient>
        </View>

        {/* AI Coach Insights */}
        <View style={styles.aiInsightsCard}>
          <LinearGradient
            colors={["#9512af", "#C58BF2"]}
            style={styles.aiInsightsGradient}
          >
            <Text style={styles.aiInsightsTitle}>AI Coach Insights</Text>
            <Text style={styles.aiInsightsText}>
              {userStats?.totalWorkouts === 0
                ? "Welcome to your fitness journey! Start with a beginner workout to build your foundation."
                : `Great job on your consistency! Keep up the momentum!`}
            </Text>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => router.push("/ai-chat")}
            >
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color="white"
                style={styles.chatIcon}
              />
              <Text style={styles.chatButtonText}>Chat with Your AI Coach</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Challenge Progress */}
        {activeChallenge ? (
          <View style={styles.challengeCard}>
            <LinearGradient
              colors={["#4ECDC4", "#44A08D"]}
              style={styles.challengeGradient}
            >
              <View style={styles.challengeHeader}>
                <Ionicons name="trophy-outline" size={24} color="white" />
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>
                    {activeChallenge.challenge.title}
                  </Text>
                  <Text style={styles.challengeProgress}>
                    {`Day ${activeChallenge.current} of ${activeChallenge.challenge.target} • Keep it up!`}
                  </Text>
                </View>
                <Text style={styles.challengePercentage}>
                  {Math.round(activeChallenge.progress)}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${activeChallenge.progress}%` },
                  ]}
                />
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.noChallengeCard}>
            <Text style={styles.noChallengeTitle}>No Active Challenges</Text>
            <Text style={styles.noChallengeText}>
              Join a challenge to stay motivated and track your progress!
            </Text>
            <TouchableOpacity
              style={styles.joinChallengeButton}
              onPress={() => router.push("/(tabs)/challenges")}
            >
              <Text style={styles.joinChallengeButtonText}>
                Browse Challenges
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Workouts</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/workout")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {quickWorkouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutInfo}>
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutLevel}>{workout.level}</Text>
                </View>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <View style={styles.workoutMeta}>
                  <View style={styles.workoutMetaItem}>
                    <Ionicons name="time-outline" size={12} color="#666" />
                    <Text style={styles.workoutMetaText}>
                      {workout.duration}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: workout.color }]}
                onPress={() => startWorkout(workout.id)}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    marginBottom: 8,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  logoutButton: {
    padding: 4,
  },
  welcomeCard: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  welcomeGradient: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  welcomeDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  aiInsightsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  aiInsightsGradient: {
    padding: 20,
  },
  aiInsightsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  aiInsightsText: {
    fontSize: 12,
    color: "white",
    lineHeight: 16,
    marginBottom: 16,
  },
  chatButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  chatIcon: {
    marginRight: 6,
  },
  chatButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  challengeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  challengeGradient: {
    padding: 16,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  challengeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  challengeProgress: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  challengePercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  noChallengeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  noChallengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  noChallengeText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  joinChallengeButton: {
    backgroundColor: "#9512af",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinChallengeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  seeAllText: {
    fontSize: 12,
    color: "#9512af",
    fontWeight: "500",
  },
  workoutCard: {
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
  workoutInfo: {
    flex: 1,
  },
  workoutHeader: {
    marginBottom: 4,
  },
  workoutLevel: {
    fontSize: 10,
    color: "#9512af",
    backgroundColor: "#F3E8F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  workoutMeta: {
    flexDirection: "row",
  },
  workoutMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  workoutMetaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  startButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  noActivityContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noActivityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  noActivityText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
