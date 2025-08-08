import { Ionicons } from "@expo/vector-icons"; // Importing Ionicons for UI icons
import { useRouter } from "expo-router"; // Navigation hook from Expo Router
import { useState } from "react"; // React hook for managing local state
import {
  ActivityIndicator, // Spinner used during loading state
  Alert, // Native alert popup
  Dimensions, // To get screen width
  Image, // For rendering images
  SafeAreaView, // Keeps content inside safe device boundaries
  StyleSheet, // Allows styling components
  Text, // Text component
  TouchableOpacity, // Pressable button
  View, // Basic container component
} from "react-native";

// Get device screen width
const { width } = Dimensions.get("window");

// Define available fitness goals
const goals = [
  { id: "improve-shape", title: "Improve Shape" },
  { id: "lean-tone", title: "Lean & Tone" },
  { id: "lose-fat", title: "Lose a Fat" },
];

export default function GoalSelection() {
  const [selectedGoal, setSelectedGoal] = useState(""); // Store selected goal
  const [isLoading, setIsLoading] = useState(false); // Loading state for button
  const router = useRouter(); // Initialize navigation

  // Handle "Next" button press
  const handleNext = async () => {
    if (!selectedGoal) {
      // Show alert if no goal is selected
      Alert.alert(
        "Please select a goal",
        "Choose your fitness goal to continue"
      );
      return;
    }

    setIsLoading(true); // Show loading spinner
    try {
      // Simulate saving selected goal (e.g., to Firebase or local storage)
      console.log("Selected goal:", selectedGoal);
      // Navigate to sign-in screen
      router.push("/signin");
    } catch (error: any) {
      // Handle error if saving fails
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top hero image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "/placeholder.svg?height=200&width=300" }} // Placeholder image
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Title and subtitle */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>What is your goal?</Text>
          <Text style={styles.subtitle}>
            It will help us to choose a best program for you
          </Text>
        </View>

        {/* Render goal options */}
        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalOption,
                selectedGoal === goal.id && styles.selectedGoalOption, // Highlight selected
              ]}
              onPress={() => setSelectedGoal(goal.id)} // Update selected goal
            >
              <Text
                style={[
                  styles.goalText,
                  selectedGoal === goal.id && styles.selectedGoalText, // Highlight text
                ]}
              >
                {goal.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.disabledButton]} // Dim if loading
          onPress={handleNext}
          disabled={isLoading} // Disable button if loading
        >
          {isLoading ? (
            <ActivityIndicator color="white" /> // Show spinner
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

// Stylesheet for layout and UI
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take full screen height
    backgroundColor: "#efdff1", // Light pink background
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  imageContainer: {
    alignItems: "center", // Center image
    marginBottom: 40,
  },
  heroImage: {
    width: width * 0.8, // Responsive width
    height: width * 0.5, // Responsive height
  },
  textContainer: {
    alignItems: "center", // Center text
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
    backgroundColor: "#92A3FD", // Highlight color
  },
  goalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedGoalText: {
    color: "white", // Invert text color on selection
  },
  nextButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto", // Push button to bottom
    marginBottom: 40,
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7, // Dim when disabled
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
