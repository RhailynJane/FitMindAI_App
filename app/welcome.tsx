"use client";
import { useRouter } from "expo-router";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>
              FitMind<Text style={styles.brandAccent}>AI</Text>
            </Text>
          </View>

          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Think sharp.</Text>
            <Text style={styles.tagline}>Feel strong.</Text>
            <Text style={styles.tagline}>Be unshakable</Text>
          </View>
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push("/onboarding")}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "space-between",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  brandContainer: {
    marginBottom: 60,
  },
  brandName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  brandAccent: {
    color: "#4A90E2",
  },
  taglineContainer: {
    alignItems: "center",
  },
  tagline: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  buttonContainer: {
    paddingBottom: 50,
  },
  getStartedButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
