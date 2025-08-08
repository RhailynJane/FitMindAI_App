import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const goalCards = [
  { icon: "walk-outline", text: "Try to complete\n10,000 steps today" },
  { icon: "water-outline", text: "Finish 4 bottles\nof water" },
  { icon: "egg-outline", text: "Eat 5 eggs\nin breakfast today" },
  { icon: "dumbbell", text: "Lift 2 kg dumbbell\n3 sets of 25 reps" },
];

const chatMessages = [
  { id: 1, role: "assistant", content: "Hi, Dotty\nReady to crush today’s goals?" },
  { id: 2, role: "user", content: "what is my goal for day?" },
  { id: 3, role: "user", content: "what workout should I do?" },
  { id: 4, role: "assistant", content: "Strength training is perfect for you." },
  { id: 5, role: "user", content: "any meal suggestion?" },
];

export default function AiCoachScreen() {
  const [input, setInput] = useState("");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Coach</Text>
        <Image
          source={{ uri: "https://i.pravatar.cc/300" }}
          style={styles.avatar}
        />
      </View>

      {/* Goal Cards */}
      <View style={styles.goalCardsContainer}>
        {goalCards.map((card, i) => (
          <View key={i} style={styles.card}>
            <MaterialCommunityIcons
              name={card.icon}
              size={36}
              color="#9512af"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.cardText}>{card.text}</Text>
          </View>
        ))}
      </View>

      {/* Chat */}
      <ScrollView style={styles.chatContainer}>
        {chatMessages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.chatBubble,
              msg.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={msg.role === "user" ? styles.userText : styles.assistantText}
            >
              {msg.content}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inputContainer}
      >
        <TouchableOpacity>
          <Ionicons name="mic" size={24} color="#9512af" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Message"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity>
          <Ionicons name="send" size={24} color="#9512af" />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Bottom Navigation Placeholder */}
      <View style={styles.bottomNav}>
        <Ionicons name="home" size={28} color="#9512af" />
        <Ionicons name="barbell-outline" size={28} color="#ccc" />
        <Ionicons name="calendar-outline" size={28} color="#ccc" />
        <Ionicons name="image-outline" size={28} color="#ccc" />
        <Ionicons name="person-outline" size={28} color="#ccc" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3E8F5", paddingTop: 40 },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#E8D5F2",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginRight: 36,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  goalCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  card: {
    width: "48%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  chatBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 20,
    marginVertical: 6,
  },
  assistantBubble: {
    backgroundColor: "#9512af",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  assistantText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: "#333",
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    fontSize: 16,
  },
  bottomNav: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
});
