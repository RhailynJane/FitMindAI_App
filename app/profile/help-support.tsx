import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * HelpSupportScreen Component
 * This screen provides help options like FAQs, contact support, etc.
 */

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function HelpSupportScreen() {
  const handleGoBack = (): void => {
    router.back();
  };

  /**
   * Open FAQ page
   */
  const handleFAQ = (): void => {
    router.push("/profile/faq");
  };

  /**
   * Contact support
   */
  const handleContactSupport = (): void => {
    Alert.alert("Contact Support", "Would you like to send us an email?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send Email",
        onPress: () => {
          Linking.openURL(
            "mailto:support@fitmindai.com?subject=Support Request"
          );
        },
      },
    ]);
  };

  /**
   * Feedback
   */
  const handleFeedback = (): void => {
    Alert.alert("Feedback", "We'd love to hear from you!", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send Feedback",
        onPress: () => {
          Linking.openURL("mailto:feedback@fitmindai.com?subject=App Feedback");
        },
      },
    ]);
  };

  /**
   * App info
   */
  const handleAppInfo = (): void => {
    Alert.alert(
      "App Information",
      "FitMindAI v1.0.0\n\nA smart fitness companion powered by AI to help you achieve your fitness goals.\n\n© 2025 FitMindAI"
    );
  };

  /**
   * Privacy Policy
   */
  const handlePrivacyPolicy = (): void => {
    Linking.openURL("https://fitmindai.com/privacy-policy");
  };

  /**
   * Terms of Service
   */
  const handleTermsOfService = (): void => {
    Linking.openURL("https://fitmindai.com/terms");
  };

  const supportOptions: SupportOption[] = [
    {
      id: "faq",
      title: "Frequently Asked Questions",
      description: "Find answers to common questions",
      icon: "help-circle-outline",
      onPress: handleFAQ,
    },
    {
      id: "contact",
      title: "Contact Support",
      description: "Get help from our support team",
      icon: "mail-outline",
      onPress: handleContactSupport,
    },

    {
      id: "feedback",
      title: "Send Feedback",
      description: "Help us improve the app",
      icon: "chatbubble-outline",
      onPress: handleFeedback,
    },
  ];

  const legalOptions: SupportOption[] = [
    {
      id: "privacy",
      title: "Privacy Policy",
      description: "How we handle your data",
      icon: "document-text-outline",
      onPress: handlePrivacyPolicy,
    },
    {
      id: "terms",
      title: "Terms of Service",
      description: "App usage terms and conditions",
      icon: "document-outline",
      onPress: handleTermsOfService,
    },
    {
      id: "about",
      title: "About FitMindAI",
      description: "App version and information",
      icon: "information-circle-outline",
      onPress: handleAppInfo,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={option.onPress}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={20} color="#9512af" />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Legal & About</Text>
          {legalOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={option.onPress}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={20} color="#9512af" />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencyContainer}>
          <Ionicons name="warning-outline" size={24} color="#FF6B6B" />
          <Text style={styles.emergencyTitle}>Need immediate help?</Text>
          <Text style={styles.emergencyText}>
            If youre experiencing a medical emergency, please contact your local
            emergency services immediately.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  placeholder: { width: 32 },
  content: { flex: 1, padding: 20 },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3e8f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionText: { flex: 1 },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  optionDescription: { fontSize: 14, color: "#666" },
  emergencyContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
    marginTop: 8,
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: "#CC5555",
    textAlign: "center",
    lineHeight: 20,
  },
});
