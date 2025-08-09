import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("window");

export default function WelcomeSuccess() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading state while auth is still loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9512af" />
        </View>
      </SafeAreaView>
    );
  }

  // Function to safely extract first name
  const getUserName = () => {
    try {
      if (!user) return "User";

      const displayName = user?.displayName?.trim?.() || "";
      if (!displayName) return "User";

      const firstName = displayName.split(/\s+/)[0];
      return firstName || "User";
    } catch (error) {
      console.error("Error parsing display name:", error);
      return "User";
    }
  };

  const handleGoToHome = () => {
    router.replace("/(tabs)/dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Centered success illustration */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/welcomesuccess.png")}
            style={styles.heroImage}
            resizeMode="contain"
            accessibilityLabel="Welcome success illustration"
          />
        </View>

        {/* Text section */}
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome, {getUserName()}!</Text>
          <Text style={styles.subtitle}>
            Youre all set! Lets reach your goals together
          </Text>
        </View>

        {/* Action button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoToHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  imageContainer: {
    flex: 1,
    maxHeight: "50%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroImage: {
    width: width * 0.8,
    height: width * 0.8,
    maxWidth: 300,
    maxHeight: 300,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    paddingBottom: 40,
  },
  homeButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  homeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
