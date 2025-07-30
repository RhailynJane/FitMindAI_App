"use client";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { exerciseApi } from "../services/exerciseApi";

interface ApiStatusCheckerProps {
  onStatusChange?: (isOnline: boolean) => void;
}

export default function ApiStatusChecker({
  onStatusChange,
}: ApiStatusCheckerProps) {
  const [status, setStatus] = useState<
    "checking" | "online" | "offline" | "error"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkApiStatus = async () => {
    try {
      setStatus("checking");
      setErrorMessage("");

      const statusResponse = await exerciseApi.checkApiStatus();
      console.log("API Status:", statusResponse);

      setStatus("online");
      onStatusChange?.(true);
    } catch (error: any) {
      console.error("API Status check failed:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to connect to ExerciseDB API");
      onStatusChange?.(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "#4CAF50";
      case "offline":
      case "error":
        return "#FF4444";
      case "checking":
        return "#FFA726";
      default:
        return "#666";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "online":
        return "checkmark-circle";
      case "offline":
      case "error":
        return "alert-circle";
      case "checking":
        return "time";
      default:
        return "help-circle";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "online":
        return "ExerciseDB API Connected";
      case "offline":
        return "ExerciseDB API Offline";
      case "error":
        return "ExerciseDB API Error";
      case "checking":
        return "Checking API Status...";
      default:
        return "Unknown Status";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Ionicons
          name={getStatusIcon() as any}
          size={16}
          color={getStatusColor()}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        <TouchableOpacity onPress={checkApiStatus} style={styles.refreshButton}>
          <Ionicons name="refresh" size={14} color="#666" />
        </TouchableOpacity>
      </View>
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  errorMessage: {
    fontSize: 11,
    color: "#FF4444",
    marginTop: 4,
    lineHeight: 14,
  },
});
