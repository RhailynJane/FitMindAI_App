import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import OpenAI from "openai";
import { useEffect, useState } from "react";
import type { ColorValue } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";

// Custom hooks and services
import { useAuth } from "../../hooks/useAuth";
import {
  firestoreService,
  type AIChallenge,
  type Challenge,
  type UserChallenge,
} from "../../services/firestoreService";

export default function ChallengesScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>(
    []
  );
  const [aiChallenges, setAiChallenges] = useState<AIChallenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingAiChallenges, setGeneratingAiChallenges] = useState(false);

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
      const [challenges, aiChallenges] = await Promise.all([
        firestoreService.getAvailableChallenges(),
        user
          ? firestoreService.getGeneratedChallenges(user.uid)
          : Promise.resolve([]),
      ]);

      setAvailableChallenges(challenges);
      setAiChallenges(aiChallenges);

      if (user) {
        const userChallenges = await firestoreService.getUserChallenges(
          user.uid
        );
        setUserChallenges(userChallenges);
      }
    } catch (error) {
      console.error("Error loading challenges:", error);
      Alert.alert("Error", "Failed to load challenges. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  const handleJoinChallenge = async (challengeId: string, isAI = false) => {
    if (!user) return;

    try {
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

      if (isAI) {
        await firestoreService.joinAIChallenge(user.uid, challengeId);
      } else {
        await firestoreService.joinChallenge(user.uid, challengeId);
      }

      Alert.alert("Success", "You have successfully joined the challenge!");
    } catch (error) {
      console.error("Error joining challenge:", error);
      Alert.alert("Error", "Failed to join challenge. Please try again.");
    }
  };

  const generateAiChallenges = async () => {
    if (!user) return;

    try {
      setGeneratingAiChallenges(true);

      const profile = await firestoreService.getUserProfile(user.uid);
      const stats = await firestoreService.getUserStats(user.uid);

      const openai = new OpenAI({
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const prompt = `Create 3 personalized fitness challenges in JSON format based on:
      - Fitness Level: ${profile?.fitnessLevel || "Intermediate"}
      - Goals: ${profile?.goals?.join(", ") || "General fitness"}
      - Equipment: ${profile?.equipment?.join(", ") || "Bodyweight only"}
      - Workouts Completed: ${stats?.totalWorkouts || 0}
      - Preferences: ${profile?.preferredTypes?.join(", ") || "Mixed"}
      
      Each challenge should have:
      - title: string
      - description: string
      - type: "consistency"|"strength"|"cardio"|"transformation"
      - duration: number (7-30 days)
      - target: number (workouts/days)
      - reward: string
      - xpReward: number (100-500)
      
      Return ONLY valid JSON like this:
      {
        "challenges": [
          {
            "title": "7-Day Cardio Blast",
            "description": "Complete 5 cardio workouts in 7 days",
            "type": "cardio",
            "duration": 7,
            "target": 5,
            "reward": "Cardio Champion Badge",
            "xpReward": 200
          }
        ]
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content:
              "You are a fitness coach AI. Generate personalized workout challenges. Return ONLY valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) throw new Error("No response from AI");

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseContent);
      } catch (e) {
        throw new Error("Invalid JSON response from AI");
      }

      const challenges = parsedResponse.challenges || [];
      if (!Array.isArray(challenges))
        throw new Error("Invalid challenges format");

      const aiChallenges: AIChallenge[] = challenges.map((challenge: any) => ({
        id: `ai-${uuidv4()}`,
        title: challenge.title || "Personalized Challenge",
        description:
          challenge.description ||
          "Complete this challenge to improve your fitness",
        type: ["consistency", "strength", "cardio", "transformation"].includes(
          challenge.type
        )
          ? challenge.type
          : "consistency",
        duration: Math.min(Math.max(parseInt(challenge.duration) || 7, 7), 30),
        target: Math.max(parseInt(challenge.target) || 5, 3),
        reward: challenge.reward || "Achievement Badge",
        xpReward: Math.min(
          Math.max(parseInt(challenge.xpReward) || 200, 100),
          500
        ),
        isActive: true,
        isAI: true,
        createdAt: new Date(),
        generatedAt: new Date(),
      }));

      await firestoreService.saveGeneratedChallenges(user.uid, aiChallenges);
      await loadChallenges();

      Alert.alert("Success", "Your personalized challenges are ready!");
    } catch (error) {
      console.error("AI Challenge Generation Error:", error);
      Alert.alert("Error", "Couldn't generate challenges. Please try again.");
    } finally {
      setGeneratingAiChallenges(false);
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
      case "transformation":
        return ["#FFA751", "#FF7B54"];
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

  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const calculateDaysLeft = (endDate: Date | string) => {
    try {
      const end = typeof endDate === "string" ? new Date(endDate) : endDate;
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (error) {
      return 0;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Challenges</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading challenges...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Challenges</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 100 : 80,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {user && (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateAiChallenges}
            disabled={generatingAiChallenges}
          >
            {generatingAiChallenges ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.generateButtonText}>
                Generate Personalized Challenges
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Active Challenges */}
        {userChallenges.filter(
          (uc) => !uc.completed && new Date() <= new Date(uc.endDate)
        ).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            {userChallenges
              .filter(
                (uc) => !uc.completed && new Date() <= new Date(uc.endDate)
              )
              .map((userChallenge) => (
                <ChallengeCard
                  key={userChallenge.id}
                  challenge={userChallenge.challenge}
                  progress={userChallenge.progress}
                  current={userChallenge.current}
                  target={userChallenge.challenge.target}
                  endDate={userChallenge.endDate}
                  reward={userChallenge.challenge.reward}
                  isAI={
                    "isAI" in userChallenge.challenge
                      ? (userChallenge.challenge as any).isAI
                      : false
                  }
                />
              ))}
          </>
        )}

        {/* AI Challenges */}
        {aiChallenges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Personalized Challenges</Text>
            {aiChallenges.map((challenge) => {
              const userProgress = getUserChallengeProgress(challenge.id);
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  progress={userProgress?.progress}
                  current={userProgress?.current}
                  target={challenge.target}
                  reward={challenge.reward}
                  isAI={true}
                  onJoin={() => handleJoinChallenge(challenge.id, true)}
                  joined={isUserJoined(challenge.id)}
                />
              );
            })}
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
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                progress={userProgress?.progress}
                current={userProgress?.current}
                target={challenge.target}
                reward={challenge.reward}
                onJoin={() => handleJoinChallenge(challenge.id)}
                joined={isUserJoined(challenge.id)}
              />
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
                          {userChallenge.challenge.title ||
                            "Untitled Challenge"}{" "}
                          ✓
                          {"isAI" in userChallenge.challenge &&
                            (userChallenge.challenge as any).isAI &&
                            " (AI)"}
                        </Text>
                        <Text style={styles.challengeDescription}>
                          Completed on {formatDate(userChallenge.endDate)}
                        </Text>
                      </View>
                      <Ionicons name="trophy" size={24} color="white" />
                    </View>
                    <Text style={styles.challengeReward}>
                      Reward Earned: {userChallenge.challenge.reward || "None"}
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

const ChallengeCard = ({
  challenge,
  progress = 0,
  current = 0,
  target = 0,
  endDate,
  reward = "None",
  isAI = false,
  onJoin,
  joined = false,
}: {
  challenge: Challenge | AIChallenge;
  progress?: number;
  current?: number;
  target?: number;
  endDate?: Date | string;
  reward?: string;
  isAI?: boolean;
  onJoin?: () => void;
  joined?: boolean;
}) => {
  const getChallengeColor = (type: string): [ColorValue, ColorValue] => {
    switch (type) {
      case "consistency":
        return ["#4ECDC4", "#44A08D"];
      case "strength":
        return ["#FF6B9D", "#FF8E9B"];
      case "cardio":
        return ["#45B7D1", "#96CEB4"];
      case "transformation":
        return ["#FFA751", "#FF7B54"];
      default:
        return ["#9512af", "#C58BF2"];
    }
  };

  const calculateDaysLeft = (endDate: Date | string | undefined) => {
    if (!endDate) return 0;
    try {
      const end = typeof endDate === "string" ? new Date(endDate) : endDate;
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (error) {
      return 0;
    }
  };

  return (
    <View style={styles.challengeCard}>
      <LinearGradient
        colors={getChallengeColor(challenge.type)}
        style={styles.challengeGradient}
      >
        <View style={styles.challengeHeader}>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>
              {challenge.title}
              {isAI && " (AI)"}
            </Text>
            <Text style={styles.challengeDescription}>
              {challenge.description}
            </Text>
          </View>
          {progress ? (
            <Text style={styles.challengePercentage}>
              {Math.round(progress)}%
            </Text>
          ) : (
            <View style={styles.challengeTypeContainer}>
              <Text style={styles.challengeType}>{challenge.type}</Text>
            </View>
          )}
        </View>

        <View style={styles.challengeDetails}>
          <Text style={styles.challengeDetailText}>
            Duration: {challenge.duration} days
          </Text>
          <Text style={styles.challengeDetailText}>
            Target: {target} workouts
          </Text>
          <Text style={styles.challengeDetailText}>Reward: {reward}</Text>
        </View>

        {progress ? (
          <View style={styles.challengeProgress}>
            <Text style={styles.progressText}>
              Day {current} of {target}
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min(100, progress)}%` },
                ]}
              />
            </View>
          </View>
        ) : null}

        {endDate && (
          <View style={styles.challengeFooter}>
            <Text style={styles.challengeReward}>Reward: {reward}</Text>
            <Text style={styles.challengeTimeLeft}>
              {calculateDaysLeft(endDate)} days left
            </Text>
          </View>
        )}

        {onJoin && (
          <TouchableOpacity
            style={[
              styles.challengeButton,
              joined && styles.challengeButtonJoined,
            ]}
            onPress={onJoin}
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
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  generateButton: {
    backgroundColor: "#6e3b6e",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
