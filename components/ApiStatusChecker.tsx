"use client";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ApiStatusCheckerProps {
  onStatusChange: (isOnline: boolean) => void;
}

export default function ApiStatusChecker({
  onStatusChange,
}: ApiStatusCheckerProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      setIsChecking(true);
      setErrorMessage(null);

      // Try to make a simple request to the API
      const response = await fetch(
        "https://exercisedb.p.rapidapi.com/exercises/bodyPartList",
        {
          headers: {
            "X-RapidAPI-Key":
              process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY || "test",
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
          },
        }
      );

      if (response.ok) {
        setIsOnline(true);
        onStatusChange(true);
        setErrorMessage(null);
      } else {
        setIsOnline(false);
        onStatusChange(false);

        if (response.status === 403) {
          setErrorMessage("API key invalid or missing");
        } else if (response.status === 429) {
          setErrorMessage("Rate limit exceeded");
        } else {
          setErrorMessage(`API error: ${response.status}`);
        }
      }
    } catch (error) {
      console.log("API check failed:", error);
      setIsOnline(false);
      onStatusChange(false);
      setErrorMessage("Connection failed");
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <Text style={styles.checkingText}>Checking API status...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isOnline ? styles.online : styles.offline]}>
      <Ionicons
        name={isOnline ? "checkmark-circle" : "alert-circle"}
        size={16}
        color={isOnline ? "#4CAF50" : "#ff4444"}
      />
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.statusText,
            isOnline ? styles.onlineText : styles.offlineText,
          ]}
        >
          ExerciseDB API: {isOnline ? "Online" : "Offline"}
        </Text>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>
      {!isOnline && (
        <TouchableOpacity onPress={checkApiStatus} style={styles.retryButton}>
          <Ionicons name="refresh" size={14} color="#ff4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  online: {
    backgroundColor: "#E8F5E8",
  },
  offline: {
    backgroundColor: "#FFEBEE",
  },
  textContainer: {
    flex: 1,
    marginLeft: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  onlineText: {
    color: "#4CAF50",
  },
  offlineText: {
    color: "#ff4444",
  },
  errorText: {
    fontSize: 10,
    color: "#ff4444",
    marginTop: 2,
  },
  checkingText: {
    fontSize: 12,
    color: "#666",
  },
  retryButton: {
    padding: 4,
  },
});
