"use client";
import { useRouter } from "expo-router";
import {
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
  const { user } = useAuth();
  const router = useRouter();

  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName.split(" ")[0];
    }
    return "User";
  };

  const handleGoToHome = () => {
    router.replace("/(tabs)/dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "/placeholder.svg?height=300&width=300" }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome, {getUserName()}!</Text>
          <Text style={styles.subtitle}>
            You are all set now, let's reach your goals together with us
          </Text>
        </View>

        <TouchableOpacity style={styles.homeButton} onPress={handleGoToHome}>
          <Text style={styles.homeButtonText}>Go to Home</Text>
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
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  homeButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 60,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
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
