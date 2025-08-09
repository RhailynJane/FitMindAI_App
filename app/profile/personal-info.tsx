import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useAuthFunctions } from "../../hooks/useAuthFunctions";
import { db } from "../../lib/firebase";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
}

interface FirestoreUserData extends UserData {
  displayName: string;
  updatedAt: Date;
}

interface InfoField {
  id: keyof UserData;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType: "default" | "email-address" | "phone-pad";
  placeholder?: string;
}

interface EditField {
  id: keyof UserData;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType: "default" | "email-address" | "phone-pad";
  placeholder?: string;
}

export default function PersonalInfoScreen() {
  const { user } = useAuth();
  const { getUserProfile } = useAuthFunctions();

  const [editableData, setEditableData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentEditField, setCurrentEditField] = useState<EditField | null>(
    null
  );
  const [currentEditValue, setCurrentEditValue] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsInitialLoading(true);
      if (!user) return;
      const userProfile = await getUserProfile(user.uid);

      if (userProfile) {
        setEditableData({
          firstName: userProfile.firstName || "",
          lastName: userProfile.lastName || "",
          email: userProfile.email || user.email || "",
          phone: userProfile.phone || "",
          birthday: userProfile.birthday || "",
          gender: userProfile.gender || "",
        });
      } else {
        setEditableData({
          firstName: user?.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
          email: user.email || "",
          phone: "",
          birthday: "",
          gender: "",
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setEditableData({
        firstName: user?.displayName?.split(" ")[0] || "",
        lastName: user?.displayName?.split(" ").slice(1).join(" ") || "",
        email: user?.email || "",
        phone: "",
        birthday: "",
        gender: "",
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  const saveUserDataPermanently = async (
    userData: UserData
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (!user) {
        throw new Error("User is not authenticated.");
      }
      const displayName =
        `${userData.firstName.trim()} ${userData.lastName.trim()}`.trim();
      const firestoreData: Partial<FirestoreUserData> = {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.trim(),
        phone: userData.phone.trim(),
        birthday: userData.birthday.trim(),
        gender: userData.gender.trim(),
        displayName,
        updatedAt: new Date(),
      };

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, firestoreData);

      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      if (userData.email !== user.email) {
        Alert.alert(
          "Email Update",
          "Email has been updated. Some features may require verification.",
          [{ text: "OK" }]
        );
      }

      setHasUnsavedChanges(false);
      return true;
    } catch (error: any) {
      console.error("Error saving user data:", error);
      Alert.alert("Error", `Failed to save changes: ${error.message}`, [
        { text: "OK" },
      ]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Save before leaving?",
        [
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
          {
            text: "Save",
            onPress: async () => {
              const success = await saveUserDataPermanently(editableData);
              if (success) router.back();
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleEditField = (field: InfoField) => {
    setCurrentEditField(field);
    setCurrentEditValue(editableData[field.id] || "");
    setIsEditModalVisible(true);
  };

  const validateField = (fieldId: string, value: string) => {
    const trimmedValue = value.trim();
    switch (fieldId) {
      case "email":
        if (trimmedValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          return "Please enter a valid email address";
        }
        break;
      case "phone":
        if (trimmedValue && !/^[\+]?[1-9][\d]{0,15}$/.test(trimmedValue)) {
          return "Please enter a valid phone number";
        }
        break;
      case "birthday":
        if (
          trimmedValue &&
          !/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(trimmedValue)
        ) {
          return "Please use MM/DD/YYYY format";
        }
        break;
      case "firstName":
      case "lastName":
        if (!trimmedValue) {
          return `${
            fieldId === "firstName" ? "First" : "Last"
          } name is required`;
        }
        break;
    }
    return null;
  };

  const handleSaveField = () => {
    if (currentEditField) {
      const trimmedValue = currentEditValue.trim();
      const validationError = validateField(currentEditField.id, trimmedValue);
      if (validationError) {
        Alert.alert("Validation Error", validationError);
        return;
      }
      setEditableData({ ...editableData, [currentEditField.id]: trimmedValue });
      setHasUnsavedChanges(true);
    }
    setIsEditModalVisible(false);
    setCurrentEditField(null);
    setCurrentEditValue("");
  };

  const handleSaveChanges = async () => {
    const success = await saveUserDataPermanently(editableData);
    if (success) {
      Alert.alert("Success", "Changes saved successfully!");
    }
  };

  const infoFields: InfoField[] = [
    {
      id: "firstName",
      label: "First Name",
      value: editableData.firstName || "Not set",
      icon: "person-outline",
      keyboardType: "default",
    },
    {
      id: "lastName",
      label: "Last Name",
      value: editableData.lastName || "Not set",
      icon: "person-outline",
      keyboardType: "default",
    },
    {
      id: "email",
      label: "Email",
      value: editableData.email || "Not set",
      icon: "mail-outline",
      keyboardType: "email-address",
    },
    {
      id: "phone",
      label: "Phone Number",
      value: editableData.phone || "Not set",
      icon: "call-outline",
      keyboardType: "phone-pad",
    },
    {
      id: "birthday",
      label: "Date of Birth",
      value: editableData.birthday || "Not set",
      icon: "calendar-outline",
      keyboardType: "default",
      placeholder: "MM/DD/YYYY",
    },
    {
      id: "gender",
      label: "Gender",
      value: editableData.gender || "Not set",
      icon: "person-outline",
      keyboardType: "default",
    },
  ];

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9512af" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={styles.placeholder}>
          {hasUnsavedChanges && <View style={styles.unsavedIndicator} />}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.fieldsContainer}>
          {infoFields.map((field, index) => (
            <TouchableOpacity
              key={field.id}
              style={[
                styles.fieldItem,
                index === infoFields.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => handleEditField(field)}
            >
              <View style={styles.fieldLeft}>
                <Ionicons name={field.icon} size={20} color="#9512af" />
                <View style={styles.fieldText}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text
                    style={[
                      styles.fieldValue,
                      field.value === "Not set" && styles.notSetText,
                    ]}
                  >
                    {field.value}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasUnsavedChanges || isLoading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveChanges}
          disabled={!hasUnsavedChanges || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Apply Changes</Text>
          )}
        </TouchableOpacity>

        {hasUnsavedChanges && (
          <Text style={styles.unsavedChangesText}>
            You have unsaved changes
          </Text>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Edit {currentEditField?.label}
            </Text>
            <TouchableOpacity onPress={handleSaveField}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{currentEditField?.label}</Text>
              <TextInput
                style={styles.textInput}
                value={currentEditValue}
                onChangeText={setCurrentEditValue}
                placeholder={
                  currentEditField?.placeholder ||
                  `Enter ${currentEditField?.label?.toLowerCase()}`
                }
                keyboardType={currentEditField?.keyboardType || "default"}
                autoFocus
              />
              {currentEditField?.id === "birthday" && (
                <Text style={styles.inputHint}>Use MM/DD/YYYY format</Text>
              )}
              {currentEditField?.id === "email" && (
                <Text style={styles.inputHint}>
                  Email changes may require verification
                </Text>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },
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
  placeholder: { width: 32, alignItems: "center", justifyContent: "center" },
  unsavedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6b6b",
  },
  content: { flex: 1, padding: 20 },
  fieldsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fieldItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: 60,
  },
  fieldLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  fieldText: { marginLeft: 12, flex: 1 },
  fieldLabel: { fontSize: 16, color: "#333", fontWeight: "500" },
  fieldValue: { fontSize: 14, color: "#666", marginTop: 2 },
  notSetText: { color: "#999", fontStyle: "italic" },
  saveButton: {
    backgroundColor: "#9512af",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    minHeight: 50,
  },
  saveButtonDisabled: { backgroundColor: "#ccc" },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  unsavedChangesText: {
    textAlign: "center",
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 10,
    fontStyle: "italic",
  },
  modalContainer: { flex: 1, backgroundColor: "#f8f9fa" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  modalCancelButton: { fontSize: 16, color: "#666" },
  modalSaveButton: { fontSize: 16, color: "#9512af", fontWeight: "600" },
  modalContent: { flex: 1, padding: 20 },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  inputHint: { fontSize: 12, color: "#999", marginTop: 6, fontStyle: "italic" },
});
