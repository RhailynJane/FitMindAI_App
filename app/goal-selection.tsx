import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthFunctions } from "../hooks/useAuthFunctions";
import { auth } from "../lib/firebase";

const { width } = Dimensions.get("window");

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const goals: {
  id: string;
  title: string;
  description: string;
  icon: IoniconName;
}[] = [
  {
    id: "weight_loss",
    title: "Weight Loss",
    description: "Lose weight and reduce body fat",
    icon: "trending-down-outline",
  },
  {
    id: "muscle_gain",
    title: "Muscle Gain",
    description: "Build muscle and increase strength",
    icon: "barbell-outline",
  },
  {
    id: "endurance",
    title: "Improve Endurance",
    description: "Increase cardiovascular fitness",
    icon: "heart-outline",
  },
  {
    id: "flexibility",
    title: "Flexibility",
    description: "Improve mobility and flexibility",
    icon: "body-outline",
  },
  {
    id: "general_fitness",
    title: "General Fitness",
    description: "Overall health and wellness",
    icon: "fitness-outline",
  },
  {
    id: "strength",
    title: "Strength Training",
    description: "Build functional strength",
    icon: "medal-outline",
  },
];

export default function GoalSelection() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { updateUserProfile } = useAuthFunctions();

  const toggleGoalSelection = (goalId: string) => {
    setSelectedGoals(
      (prev) =>
        prev.includes(goalId)
          ? prev.filter((id) => id !== goalId) // Remove if already selected
          : [...prev, goalId] // Add if not selected
    );
  };

  const handleSubmit = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert(
        "Please select at least one goal",
        "Choose your fitness goals to continue"
      );
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update user profile with selected goals
      await updateUserProfile(user.uid, { fitnessGoals: selectedGoals });

      console.log("Goals updated:", selectedGoals);
      router.push("/signin");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>What are your fitness goals?</Text>
          <Text style={styles.subtitle}>
            Select all that apply to help us customize your experience
          </Text>
        </View>

        {/* Goal Selection Grid */}
        <View style={styles.goalsGrid}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.includes(goal.id) && styles.selectedGoalCard,
              ]}
              onPress={() => toggleGoalSelection(goal.id)}
              activeOpacity={0.8}
            >
              <View style={styles.goalIconContainer}>
                <Ionicons
                  name={goal.icon}
                  size={24}
                  color={selectedGoals.includes(goal.id) ? "white" : "#9512af"}
                />
              </View>
              <Text
                style={[
                  styles.goalTitle,
                  selectedGoals.includes(goal.id) && styles.selectedGoalText,
                ]}
              >
                {goal.title}
              </Text>
              <Text
                style={[
                  styles.goalDescription,
                  selectedGoals.includes(goal.id) &&
                    styles.selectedGoalDescription,
                ]}
              >
                {goal.description}
              </Text>
              {selectedGoals.includes(goal.id) && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {selectedGoals.length > 0
                  ? `Continue (${selectedGoals.length} selected)`
                  : "Continue"}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
            </>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  heroImage: {
    width: width * 0.8,
    height: width * 0.5,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  goalCard: {
    width: width * 0.43,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedGoalCard: {
    backgroundColor: "#9512af",
    shadowColor: "#9512af",
    shadowOpacity: 0.3,
  },
  goalIconContainer: {
    backgroundColor: "#f0d9f2",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  selectedGoalText: {
    color: "white",
  },
  goalDescription: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  selectedGoalDescription: {
    color: "#e0c4e3",
  },
  selectedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#6a0dad",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
  },
  nextButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});
