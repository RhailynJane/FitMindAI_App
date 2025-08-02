import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface PlaceholderWorkoutImageProps {
  exerciseName: string;
  size?: number;
}

export default function PlaceholderWorkoutImage({
  exerciseName,
  size = 300,
}: PlaceholderWorkoutImageProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Ionicons name="fitness-outline" size={size / 4} color="#9512af" />
      <Text style={styles.text}>{exerciseName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f3e8f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#9512af",
    textAlign: "center",
  },
});
