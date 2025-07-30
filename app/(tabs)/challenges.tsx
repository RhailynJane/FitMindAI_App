"use client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  ColorValue,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import {
  firestoreService,
  type Challenge,
  type UserChallenge,
} from "../../services/firestoreService";

export default function ChallengesScreen() {
  const { user } = useAuth();
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>(
    []
  );
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

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

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      // Check if user already joined this challenge
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

      await firestoreService.joinChallenge(user.uid, challengeId);
      Alert.alert("Success", "You have successfully joined the challenge!");
    } catch (error) {
      console.error("Error joining challenge:", error);
      Alert.alert("Error", "Failed to join challenge. Please try again.");
    }
  };

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

  const isUserJoined = (challengeId: string) => {
    return userChallenges.some(
      (uc) => uc.challengeId === challengeId && !uc.completed
    );
  };

  const getUserChallengeProgress = (challengeId: string) => {
    return userChallenges.find(
      (uc) => uc.challengeId === challengeId && !uc.completed
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Challenges</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading challenges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Challenges</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Challenges */}
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

        {/* Available Challenges */}
        <Text style={styles.sectionTitle}>Available Challenges</Text>

        {availableChallenges.length === 0 ? (
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

        {/* Completed Challenges */}
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
    </SafeAreaView>
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
