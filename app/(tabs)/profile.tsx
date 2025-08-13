import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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

// Define the structure for profile option items
interface ProfileOption {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

/**
 * ProfileScreen Component
 *
 * This is the main profile screen that displays user information and provides
 * access to various profile-related settings and options. The screen includes:
 * - User avatar and basic information display
 * - Navigation options for different profile settings
 * - Logout functionality with confirmation
 *
 * The component uses Expo Router for navigation between different profile sections
 * and integrates with the authentication system for user data and logout functionality.
 */
export default function ProfileScreen() {
  // Get current user data from authentication context
  // This hook provides access to the currently logged-in user's information
  const { user } = useAuth();

  // Get authentication functions (logout, etc.)
  // This hook provides access to authentication-related functions
  const { logout } = useAuthFunctions();

  /**
   * Handles user logout with confirmation dialog
   *
   * This function shows a native alert dialog to confirm the logout action
   * before proceeding. It includes proper error handling for the logout process.
   *
   * Flow:
   * 1. Shows confirmation alert with Cancel/Logout options
   * 2. If user confirms, attempts to logout using the logout function
   * 3. Handles any errors that might occur during logout
   */
  const handleLogout = async (): Promise<void> => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
            // Optionally show error alert to user
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  /**
   * Handle navigation for Personal Information section
   *
   * Navigates to the personal information screen where users can view
   * and edit their basic profile details like name, email, phone, etc.
   */
  const handlePersonalInfo = (): void => {
    // Check if the route exists, otherwise show coming soon
    try {
      router.push("/profile/personal-info");
    } catch (error) {
      handleComingSoon("Personal Information");
    }
  };

  /**
   * Handle navigation for Fitness Goals section
   *
   * Navigates to the fitness goals screen where users can set and
   * modify their fitness objectives, target weight, activity level, etc.
   */
  const handleFitnessGoals = (): void => {
    try {
      router.push("/profile/fitness-goals");
    } catch (error) {
      handleComingSoon("Fitness Goals");
    }
  };

  /**
   * Handle navigation for Notifications settings
   *
   * Navigates to the notifications settings screen where users can manage
   * their notification preferences for workouts, reminders, achievements, etc.
   */
  const handleNotifications = (): void => {
    try {
      router.push("/profile/notifications");
    } catch (error) {
      handleComingSoon("Notifications");
    }
  };

  /**
   * Handle navigation for Privacy & Security section
   *
   * Navigates to the privacy and security screen where users can manage
   * their account security settings, privacy preferences, data management, etc.
   */
  const handlePrivacySecurity = (): void => {
    try {
      router.push("/profile/privacy-security");
    } catch (error) {
      handleComingSoon("Privacy & Security");
    }
  };

  /**
   * Handle navigation for Help & Support section
   *
   * Navigates to the help and support screen where users can access
   * FAQs, contact support, view tutorials, and get assistance.
   */
  const handleHelpSupport = (): void => {
    try {
      router.push("/profile/help-support");
    } catch (error) {
      handleComingSoon("Help & Support");
    }
  };

  /**
   * Generic handler for options that don't have dedicated screens yet
   *
   * Shows a "coming soon" alert for features that are planned but not
   * yet implemented. This provides user feedback while maintaining
   * the interactive feel of the interface.
   *
   * @param title - The title of the feature that's coming soon
   */
  const handleComingSoon = (title: string): void => {
    Alert.alert(
      "Coming Soon",
      `${title} feature is coming soon! We're working hard to bring you this functionality.`,
      [{ text: "OK", style: "default" }]
    );
  };

  /**
   * Configuration array for profile navigation options
   *
   * This array defines all the profile menu items with their corresponding
   * icons, titles, and handler functions. Each option is rendered as a
   * touchable item in the profile options list.
   *
   * Structure:
   * - id: Unique identifier for React key prop
   * - title: Display text for the option
   * - icon: Ionicons icon name (typed for safety)
   * - onPress: Function to execute when option is tapped
   */
  const profileOptions: ProfileOption[] = [
    {
      id: "1",
      title: "Personal Information",
      icon: "person-outline",
      onPress: handlePersonalInfo,
    },
    {
      id: "2",
      title: "Fitness Goals",
      icon: "at-outline",
      onPress: handleFitnessGoals,
    },

    {
      id: "4",
      title: "Notifications",
      icon: "notifications-outline",
      onPress: handleNotifications,
    },
    {
      id: "5",
      title: "Privacy & Security",
      icon: "shield-outline",
      onPress: handlePrivacySecurity,
    },
    {
      id: "6",
      title: "Help & Support",
      icon: "help-circle-outline",
      onPress: handleHelpSupport,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* 
        Header section with screen title
        Provides consistent branding and navigation context
      */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 
          User Information Card
          Displays the user's avatar, display name, and email in a prominent card.
          The avatar shows a default person icon if no profile picture is available.
          The display name falls back to "User" if not set, and shows the email below.
        */}
        <View style={styles.userCard}>
          {/* 
            Avatar container with default person icon
            Uses a circular background with brand colors for visual consistency
          */}
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#9512af" />
          </View>

          {/* 
            User details section
            Shows user name and email with proper fallbacks for missing data
          */}
          <View style={styles.userInfo}>
            {/* Display name with fallback to "User" if not available */}
            <Text style={styles.userName}>{user?.displayName || "User"}</Text>
            {/* User email address - should always be available for authenticated users */}
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* 
          Profile Options Menu
          Renders a list of navigational options for profile settings.
          Each option is interactive and includes an icon, title, and navigation chevron.
          The options are dynamically generated from the profileOptions array.
        */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={option.onPress}
              activeOpacity={0.7} // Provides visual feedback on press
            >
              {/* Option icon from Ionicons */}
              <Ionicons name={option.icon} size={20} color="#9512af" />

              {/* Option title text */}
              <Text style={styles.optionText}>{option.title}</Text>

              {/* Right chevron arrow indicating navigation */}
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 
          Logout Button
          Styled as a prominent action button with destructive styling.
          Includes confirmation dialog to prevent accidental logouts.
          The button uses red/warning colors to indicate it's a destructive action.
        */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8} // Slightly different opacity for destructive action
        >
          <Ionicons name="log-out-outline" size={20} color="#FF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Stylesheet for ProfileScreen component
 *
 * Uses a clean, modern design with:
 * - Light background colors for better readability
 * - Consistent spacing and padding throughout
 * - Card-based layout with subtle shadows
 * - Brand colors (#9512af) for icons and accents
 * - Proper accessibility considerations for text sizes and contrast
 */
const styles = StyleSheet.create({
  // Main container with light background
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Header styling with bottom border for separation
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    marginBottom: 8,
  },

  // Header title text styling with proper hierarchy
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  // Scrollable content area with consistent padding
  content: {
    flex: 1,
    padding: 20,
  },

  // User information card with elevation and rounded corners
  userCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    // iOS shadow properties for depth
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

  // User info text container with flex for proper layout
  userInfo: {
    flex: 1,
  },

  // User name text styling with proper weight and spacing
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  // User email text styling with muted color
  userEmail: {
    fontSize: 14,
    color: "#666",
  },

  // Container for profile options list with consistent card styling
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

  // Individual option item with horizontal layout and subtle borders
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

  // Logout button with centered content and card styling
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

  // Logout button text with warning color for destructive action
  logoutText: {
    fontSize: 16,
    color: "#FF4444", // Red color to indicate destructive action
    fontWeight: "500",
    marginLeft: 8,
  },
});
