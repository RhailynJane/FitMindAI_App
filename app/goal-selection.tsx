"use client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const goals = [
  { id: "improve-shape", title: "Improve Shape" },
  { id: "lean-tone", title: "Lean & Tone" },
  { id: "lose-fat", title: "Lose a Fat" },
];

export default function GoalSelection() {
  const [selectedGoal, setSelectedGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNext = async () => {
    if (!selectedGoal) {
      Alert.alert(
        "Please select a goal",
        "Choose your fitness goal to continue"
      );
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically save the goal to Firebase
      console.log("Selected goal:", selectedGoal);
      // Navigate to sign in
      router.push("/signin");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "/placeholder.svg?height=200&width=300" }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>What is your goal?</Text>
          <Text style={styles.subtitle}>
            It will help us to choose a best program for you
          </Text>
        </View>

        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalOption,
                selectedGoal === goal.id && styles.selectedGoalOption,
              ]}
              onPress={() => setSelectedGoal(goal.id)}
            >
              <Text
                style={[
                  styles.goalText,
                  selectedGoal === goal.id && styles.selectedGoalText,
                ]}
              >
                {goal.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.disabledButton]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>Next</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  heroImage: {
    width: width * 0.8,
    height: width * 0.5,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  goalsContainer: {
    marginBottom: 60,
  },
  goalOption: {
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedGoalOption: {
    backgroundColor: "#92A3FD",
  },
  goalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedGoalText: {
    color: "white",
  },
  nextButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    marginBottom: 40,
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
