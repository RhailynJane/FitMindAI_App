import type React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

interface PlaceholderImageProps {
  width: number;
  height: number;
  text?: string;
  style?: ViewStyle;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width,
  height,
  text = "Image",
  style,
}) => {
  return (
    <View style={[styles.placeholder, { width, height }, style]}>
      <Text style={styles.placeholderText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  placeholderText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
});
