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

/**
 * ProfileScreen Component
 *
 * Displays user profile information and provides access to various profile-related
 * settings and options. Includes user avatar, personal info, navigation options,
 * and logout functionality.
 */
export default function ProfileScreen() {
  // Get current user data from authentication context
  const { user } = useAuth();

  // Get authentication functions (logout, etc.)
  const { logout } = useAuthFunctions();

  /**
   * Handles user logout with confirmation dialog
   * Shows an alert to confirm logout action before proceeding
   */
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

  /**
   * Configuration array for profile navigation options
   * Each option includes an id, display title, and corresponding icon
   * TODO: Add navigation handlers for each option
   */
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
      {/* Header section with screen title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Information Card */}
        {/* Displays user avatar, name, and email in a card layout */}
        <View style={styles.userCard}>
          {/* Avatar with default person icon */}
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#9512af" />
          </View>

          {/* User details section */}
          <View style={styles.userInfo}>
            {/* Display name with fallback to "User" if not available */}
            <Text style={styles.userName}>{user?.displayName || "User"}</Text>
            {/* User email address */}
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Profile Options Menu */}
        {/* Renders a list of navigational options for profile settings */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.optionItem}>
              {/* Option icon */}
              <Ionicons name={option.icon as any} size={20} color="#9512af" />

              {/* Option title text */}
              <Text style={styles.optionText}>{option.title}</Text>

              {/* Right chevron arrow indicating navigation */}
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        {/* Styled as a prominent action button with confirmation dialog */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main container with light background
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Header styling with bottom border
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  // Header title text styling
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },

  // Scrollable content area with padding
  content: {
    flex: 1,
    padding: 20,
  },

  // User information card with shadow and rounded corners
  userCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android shadow property
    elevation: 2,
  },

  // Circular avatar container with brand color background
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3E8F5", // Light purple to complement brand color
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  // User info text container
  userInfo: {
    flex: 1,
  },

  // User name text styling
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  // User email text styling
  userEmail: {
    fontSize: 14,
    color: "#666",
  },

  // Container for profile options list
  optionsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    // Consistent shadow styling with user card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Individual option item with horizontal layout and border
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  // Option text styling with flex for proper spacing
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },

  // Logout button with centered content and consistent styling
  logoutButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // Consistent shadow styling
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Logout button text with warning color
  logoutText: {
    fontSize: 16,
    color: "#FF4444", // Red color to indicate destructive action
    fontWeight: "500",
    marginLeft: 8,
  },
});
