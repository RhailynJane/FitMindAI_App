"use client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WorkoutCompleteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/dashboard")}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.completedContainer}>
          <View style={styles.completedIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#9512af" />
          </View>
          <Text style={styles.completedTitle}>Workout Completed!</Text>
          <Text style={styles.completedSubtitle}>You've crushed it today!</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color="#9512af" />
            <Text style={styles.statValue}>15:00</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={24} color="#9512af" />
            <Text style={styles.statValue}>150</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="fitness-outline" size={24} color="#9512af" />
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            // Share functionality would go here
            console.log("Share workout");
          }}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.shareButtonText}>Share Results</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.push("/(tabs)/dashboard")}
        >
          <Text style={styles.doneButtonText}>Done</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    alignItems: "flex-end",
  },
  completedContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 60,
  },
  completedIconContainer: {
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 60,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  shareButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#9512af",
    borderRadius: 25,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#9512af",
    fontSize: 16,
    fontWeight: "600",
  },
});
