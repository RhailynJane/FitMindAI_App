import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthFunctions } from "../../hooks/useAuthFunctions";
import { auth } from "../../lib/firebase";

export default function FitnessGoalsScreen() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { updateUserProfile } = useAuthFunctions();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSaveGoals = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      // Save goals to Firestore
      await updateUserProfile(user.uid, { fitnessGoals: selectedGoals });

      // Show modal
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error saving fitness goals:", error);
    }
  };

  const fitnessGoals = [
    {
      id: "weight_loss",
      title: "Weight Loss",
      description: "Lose weight and reduce body fat",
      icon: "trending-down-outline",
    },
    {
      id: "muscle_gain",
      title: "Muscle Gain",
      description: "Build muscle and increase strength",
      icon: "barbell-outline",
    },
    {
      id: "endurance",
      title: "Improve Endurance",
      description: "Increase cardiovascular fitness",
      icon: "heart-outline",
    },
    {
      id: "flexibility",
      title: "Flexibility",
      description: "Improve mobility and flexibility",
      icon: "body-outline",
    },
    {
      id: "general_fitness",
      title: "General Fitness",
      description: "Overall health and wellness",
      icon: "fitness-outline",
    },
    {
      id: "strength",
      title: "Strength Training",
      description: "Build functional strength",
      icon: "medal-outline",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fitness Goals</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>
            What are your fitness goals?
          </Text>
          <Text style={styles.instructionsText}>
            Select one or more goals that align with your fitness journey.
          </Text>
        </View>

        {/* Goals */}
        <View style={styles.goalsContainer}>
          {fitnessGoals.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalItem, isSelected && styles.goalItemSelected]}
                onPress={() => handleGoalToggle(goal.id)}
              >
                <View style={styles.goalLeft}>
                  <View
                    style={[
                      styles.goalIcon,
                      isSelected && styles.goalIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={goal.icon as any}
                      size={24}
                      color={isSelected ? "white" : "#9512af"}
                    />
                  </View>
                  <View style={styles.goalText}>
                    <Text
                      style={[
                        styles.goalTitle,
                        isSelected && styles.goalTitleSelected,
                      ]}
                    >
                      {goal.title}
                    </Text>
                    <Text
                      style={[
                        styles.goalDescription,
                        isSelected && styles.goalDescriptionSelected,
                      ]}
                    >
                      {goal.description}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color="#9512af" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedGoals.length === 0 && styles.saveButtonDisabled,
          ]}
          disabled={selectedGoals.length === 0}
          onPress={handleSaveGoals}
        >
          <Text
            style={[
              styles.saveButtonText,
              selectedGoals.length === 0 && styles.saveButtonTextDisabled,
            ]}
          >
            Save Goals ({selectedGoals.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#9512af" />
            <Text style={styles.modalTitle}>Goals Saved!</Text>
            <Text style={styles.modalText}>
              Weve updated your fitness preferences.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(false);
                router.push("/profile");
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  goalsContainer: {
    marginBottom: 24,
  },
  goalItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalItemSelected: {
    borderColor: "#9512af",
    backgroundColor: "#f9f5ff",
  },
  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3e8f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  goalIconSelected: {
    backgroundColor: "#9512af",
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  goalTitleSelected: {
    color: "#9512af",
  },
  goalDescription: {
    fontSize: 14,
    color: "#666",
  },
  goalDescriptionSelected: {
    color: "#7a1fa2",
  },
  saveButton: {
    backgroundColor: "#9512af",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonTextDisabled: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    color: "#333",
  },
  modalText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 8,
  },
  modalButton: {
    backgroundColor: "#9512af",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
