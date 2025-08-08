// Import necessary components and hooks
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import type { ColorValue } from "react-native";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Custom hooks and services
import { useAuth } from "../../hooks/useAuth";
import {
  firestoreService,
  type Challenge,
  type UserChallenge,
} from "../../services/firestoreService";

// Main screen component
export default function ChallengesScreen() {
  // Get current authenticated user
  const { user } = useAuth();

  // Safe area inset for layout adjustment
  const insets = useSafeAreaInsets();

  // State to manage available and user-specific challenges
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>(
    []
  );
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true); // Loading state for initial fetch

  // Load challenges when component mounts
  useEffect(() => {
    loadChallenges();
  }, []);

  // Subscribe to live updates of user challenges
  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestoreService.subscribeToUserChallenges(
      user.uid,
      (challenges) => {
        setUserChallenges(challenges);
      }
    );

    return unsubscribe;
  }, [user]);

  // Load all challenges and user's joined challenges
  const loadChallenges = async () => {
    try {
      setLoading(true);
      const challenges = await firestoreService.getAvailableChallenges();
      setAvailableChallenges(challenges);

      if (user) {
        const userChallenges = await firestoreService.getUserChallenges(
          user.uid
        );
        setUserChallenges(userChallenges);
      }
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle joining a challenge
  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      // Prevent user from joining an already joined (and not completed) challenge
      const alreadyJoined = userChallenges.some(
        (uc) => uc.challengeId === challengeId && !uc.completed
      );

      if (alreadyJoined) {
        Alert.alert(
          "Already Joined",
          "You have already joined this challenge!"
        );
        return;
      }

      // Join the challenge and confirm success
      await firestoreService.joinChallenge(user.uid, challengeId);
      Alert.alert("Success", "You have successfully joined the challenge!");
    } catch (error) {
      console.error("Error joining challenge:", error);
      Alert.alert("Error", "Failed to join challenge. Please try again.");
    }
  };

  // Get gradient color based on challenge type
  const getChallengeColor = (type: string): [ColorValue, ColorValue] => {
    switch (type) {
      case "consistency":
        return ["#4ECDC4", "#44A08D"];
      case "strength":
        return ["#FF6B9D", "#FF8E9B"];
      case "cardio":
        return ["#45B7D1", "#96CEB4"];
      default:
        return ["#9512af", "#C58BF2"];
    }
  };

  // Check if the user has joined the challenge
  const isUserJoined = (challengeId: string) => {
    return userChallenges.some(
      (uc) => uc.challengeId === challengeId && !uc.completed
    );
  };

  // Get progress info for a specific challenge
  const getUserChallengeProgress = (challengeId: string) => {
    return userChallenges.find(
      (uc) => uc.challengeId === challengeId && !uc.completed
    );
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Challenges</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading challenges...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Challenges</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 100 : 80,
        }}
      >
        {/* Active Challenges Section */}
        {userChallenges.filter(
          (uc) => !uc.completed && new Date() <= uc.endDate
        ).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            {userChallenges
              .filter((uc) => !uc.completed && new Date() <= uc.endDate)
              .map((userChallenge) => (
                <View key={userChallenge.id} style={styles.challengeCard}>
                  <LinearGradient
                    colors={getChallengeColor(userChallenge.challenge.type)}
                    style={styles.challengeGradient}
                  >
                    {/* Header with title and progress */}
                    <View style={styles.challengeHeader}>
                      <View style={styles.challengeInfo}>
                        <Text style={styles.challengeTitle}>
                          {userChallenge.challenge.title}
                        </Text>
                        <Text style={styles.challengeDescription}>
                          {userChallenge.challenge.description}
                        </Text>
                      </View>
                      <Text style={styles.challengePercentage}>
                        {Math.round(userChallenge.progress)}%
                      </Text>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.challengeProgress}>
                      <Text style={styles.progressText}>
                        Day {userChallenge.current} of{" "}
                        {userChallenge.challenge.target}
                      </Text>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            { width: `${userChallenge.progress}%` },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Footer with reward and time left */}
                    <View style={styles.challengeFooter}>
                      <Text style={styles.challengeReward}>
                        Reward: {userChallenge.challenge.reward}
                      </Text>
                      <Text style={styles.challengeTimeLeft}>
                        {Math.ceil(
                          (userChallenge.endDate.getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days left
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
          </>
        )}

        {/* Available Challenges Section */}
        <Text style={styles.sectionTitle}>Available Challenges</Text>

        {availableChallenges.length === 0 ? (
          // No available challenges fallback UI
          <View style={styles.noChallengesContainer}>
            <Ionicons name="trophy-outline" size={48} color="#ccc" />
            <Text style={styles.noChallengesTitle}>
              No challenges available
            </Text>
            <Text style={styles.noChallengesText}>
              Check back later for new challenges!
            </Text>
          </View>
        ) : (
          availableChallenges.map((challenge) => {
            const userProgress = getUserChallengeProgress(challenge.id);
            const joined = isUserJoined(challenge.id);

            return (
              <View key={challenge.id} style={styles.challengeCard}>
                <LinearGradient
                  colors={getChallengeColor(challenge.type)}
                  style={styles.challengeGradient}
                >
                  {/* Challenge header */}
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeTitle}>
                        {challenge.title}
                      </Text>
                      <Text style={styles.challengeDescription}>
                        {challenge.description}
                      </Text>
                    </View>
                    <View style={styles.challengeTypeContainer}>
                      <Text style={styles.challengeType}>{challenge.type}</Text>
                    </View>
                  </View>

                  {/* Challenge basic details */}
                  <View style={styles.challengeDetails}>
                    <Text style={styles.challengeDetailText}>
                      Duration: {challenge.duration} days
                    </Text>
                    <Text style={styles.challengeDetailText}>
                      Target: {challenge.target} workouts
                    </Text>
                    <Text style={styles.challengeDetailText}>
                      Reward: {challenge.reward}
                    </Text>
                  </View>

                  {/* Progress bar if user already joined */}
                  {userProgress ? (
                    <View style={styles.challengeProgress}>
                      <Text style={styles.progressText}>
                        Progress: {userProgress.current} / {challenge.target}
                      </Text>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            { width: `${userProgress.progress}%` },
                          ]}
                        />
                      </View>
                    </View>
                  ) : null}

                  {/* Join button */}
                  <TouchableOpacity
                    style={[
                      styles.challengeButton,
                      joined && styles.challengeButtonJoined,
                    ]}
                    onPress={() => handleJoinChallenge(challenge.id)}
                    disabled={joined}
                  >
                    <Text
                      style={[
                        styles.challengeButtonText,
                        joined && styles.challengeButtonTextJoined,
                      ]}
                    >
                      {joined ? "Joined" : "Join Challenge"}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            );
          })
        )}

        {/* Completed Challenges Section */}
        {userChallenges.filter((uc) => uc.completed).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Completed Challenges</Text>
            {userChallenges
              .filter((uc) => uc.completed)
              .map((userChallenge) => (
                <View key={userChallenge.id} style={styles.challengeCard}>
                  <LinearGradient
                    colors={["#4CAF50", "#45A049"]}
                    style={styles.challengeGradient}
                  >
                    <View style={styles.challengeHeader}>
                      <View style={styles.challengeInfo}>
                        <Text style={styles.challengeTitle}>
                          {userChallenge.challenge.title} ✓
                        </Text>
                        <Text style={styles.challengeDescription}>
                          Completed on{" "}
                          {userChallenge.endDate.toLocaleDateString()}
                        </Text>
                      </View>
                      <Ionicons name="trophy" size={24} color="white" />
                    </View>
                    <Text style={styles.challengeReward}>
                      Reward Earned: {userChallenge.challenge.reward}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
          </>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    marginTop: 10,
  },
  challengeCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 16,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  challengePercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  challengeTypeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeType: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  challengeDetails: {
    marginBottom: 16,
  },
  challengeDetailText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 2,
  },
  challengeProgress: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
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
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  challengeReward: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  challengeTimeLeft: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  challengeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  challengeButtonJoined: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  challengeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  challengeButtonTextJoined: {
    opacity: 0.7,
  },
  noChallengesContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noChallengesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  noChallengesText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
