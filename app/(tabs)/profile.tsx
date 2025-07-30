"use client";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useAuthFunctions } from "../../hooks/useAuthFunctions";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { logout } = useAuthFunctions();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const profileOptions = [
    { id: "1", title: "Personal Information", icon: "person-outline" },
    { id: "2", title: "Fitness Goals", icon: "target-outline" },
    { id: "3", title: "Workout Preferences", icon: "settings-outline" },
    { id: "4", title: "Notifications", icon: "notifications-outline" },
    { id: "5", title: "Privacy & Security", icon: "shield-outline" },
    { id: "6", title: "Help & Support", icon: "help-circle-outline" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#9512af" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || "User"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.optionItem}>
              <Ionicons name={option.icon as any} size={20} color="#9512af" />
              <Text style={styles.optionText}>{option.title}</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3E8F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  optionsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF4444",
    fontWeight: "500",
    marginLeft: 8,
  },
});
