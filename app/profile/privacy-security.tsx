import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useAuthFunctions } from "../../hooks/useAuthFunctions";

export default function PrivacySecurityScreen() {
  const { userProfile, user } = useAuth();
  const router = useRouter();
  const { changePassword, deleteAccount, loading } = useAuthFunctions();

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    newPass: "",
  });

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.newPass) {
      Alert.alert("Error", "Please fill in both password fields");
      return;
    }
    try {
      await changePassword(passwordData.current, passwordData.newPass);
      Alert.alert("Success", "Password changed");
      setPasswordData({ current: "", newPass: "" });
      setShowPasswordFields(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== userProfile?.displayName) {
      Alert.alert("Error", "Name does not match your profile");
      return;
    }
    if (!user) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }
    try {
      await deleteAccount(userProfile.uid, user); // removed password requirement
      Alert.alert("Account deleted");
      setDeleteModal(false);
      router.replace("/signup");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Account Security</Text>

      {/* Change Password */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowPasswordFields((prev) => !prev)}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      {showPasswordFields && (
        <View style={styles.passwordFields}>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            value={passwordData.current}
            onChangeText={(t) =>
              setPasswordData({ ...passwordData, current: t })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={passwordData.newPass}
            onChangeText={(t) =>
              setPasswordData({ ...passwordData, newPass: t })
            }
          />
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Save New Password</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Account */}
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={() => setDeleteModal(true)}
      >
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>

      {/* Delete confirmation modal */}
      <Modal visible={deleteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalWarning}>
              Type your full name ({userProfile?.displayName}) to confirm
            </Text>
            <TextInput
              style={styles.input}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
            />
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Confirm Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setDeleteModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  button: {
    backgroundColor: "#6f42c1",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveButton: { backgroundColor: "#28a745" },
  deleteButton: { backgroundColor: "#dc3545" },
  cancelButton: { backgroundColor: "#6c757d" },
  buttonText: { color: "white", textAlign: "center", fontWeight: "600" },
  passwordFields: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  modalWarning: { fontSize: 14, color: "#333", marginBottom: 12 },
});
