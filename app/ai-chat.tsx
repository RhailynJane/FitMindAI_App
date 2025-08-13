import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";
import openai from "../lib/openai";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 🔹 Firestore document reference for this user's main chat
  const chatRef = user && doc(db, "users", user.uid, "chats", "main");

  // 🔹 Load chat history in real time
  useEffect(() => {
    if (!user || !chatRef) return;

    const unsubscribe = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(
          (data.messages || []).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
      } else {
        // Initialize chat if it doesn't exist
        setMessages([
          {
            id: "1",
            text: "Hi! I'm your AI fitness coach. I can help you create personalized workout plans, answer fitness questions, and provide motivation. What would you like to work on today?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    });

    return () => unsubscribe();
  }, [user, chatRef]);

  // 🔹 Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // 🔹 Save message to Firestore
  const saveMessage = async (message: Message) => {
    if (!user || !chatRef) return;

    await setDoc(
      chatRef,
      {
        messages: arrayUnion({
          ...message,
          timestamp: message.timestamp.toISOString(),
        }),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  // 🔹 Call OpenAI API
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly and knowledgeable AI fitness coach. " +
              "You give short, clear, and motivational responses. " +
              "You provide guidance on workouts, nutrition, and recovery. " +
              "When giving workout advice, adapt to the user’s fitness level and available equipment. " +
              "Use an encouraging tone but avoid being overly verbose.",
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return (
        completion.choices[0]?.message?.content?.trim() ??
        "I’m not sure how to answer that — could you try rephrasing?"
      );
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "I’m having trouble connecting right now — let’s try again in a moment.";
    }
  };

  // 🔹 Handle sending message
  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Local + Firestore
    setMessages((prev) => [...prev, userMessage]);
    await saveMessage(userMessage);

    setInputText("");
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(userMessage.text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      await saveMessage(aiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { text: "Create workout plan", icon: "fitness" },
    { text: "Motivation tips", icon: "heart" },
    { text: "Beginner guide", icon: "school" },
  ];

  const handleQuickAction = (actionText: string) => {
    setInputText(actionText);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AI Fitness Coach</Text>
          <Text style={styles.headerSubtitle}>Always here to help</Text>
        </View>
        <View style={styles.aiIndicator}>
          <View style={styles.aiDot} />
        </View>
      </View>

      {/* Chat */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser && styles.userMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.aiText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    message.isUser ? styles.userTimestamp : styles.aiTimestamp,
                  ]}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={styles.messageContainer}>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsContainer}
        >
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              onPress={() => handleQuickAction(action.text)}
            >
              <Ionicons name={action.icon as any} size={16} color="#9512af" />
              <Text style={styles.quickActionText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about fitness..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={!inputText.trim() ? "#ccc" : "white"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerInfo: { flex: 1, marginLeft: 16 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  headerSubtitle: { fontSize: 12, color: "#666" },
  aiIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "white" },
  chatContainer: { flex: 1 },
  messagesContainer: { flex: 1, padding: 16 },
  messageContainer: { marginBottom: 16, alignItems: "flex-start" },
  userMessageContainer: { alignItems: "flex-end" },
  messageBubble: { maxWidth: "80%", padding: 12, borderRadius: 16 },
  aiBubble: { backgroundColor: "white", borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: "#9512af", borderBottomRightRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 20 },
  aiText: { color: "#333" },
  userText: { color: "white" },
  timestamp: { fontSize: 10, marginTop: 4 },
  aiTimestamp: { color: "#999" },
  userTimestamp: { color: "rgba(255,255,255,0.7)" },
  typingIndicator: { flexDirection: "row", alignItems: "center" },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9512af",
    marginHorizontal: 2,
  },
  quickActionsContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quickActionText: { fontSize: 12, color: "#9512af", marginLeft: 4 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#9512af",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: { backgroundColor: "#f0f0f0" },
});
