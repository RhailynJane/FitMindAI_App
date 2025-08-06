"use client";
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
import { useAuth } from "../hooks/useAuth";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI fitness coach. I can help you create personalized workout plans, answer fitness questions, and provide motivation. What would you like to work on today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lowerMessage = userMessage.toLowerCase();

    // Simple AI responses based on keywords
    if (lowerMessage.includes("workout") || lowerMessage.includes("exercise")) {
      return "Great! I'd love to help you with a workout plan. Based on your fitness level, I recommend starting with a mix of cardio and strength training. Would you like me to create a personalized plan for you?";
    }

    if (lowerMessage.includes("diet") || lowerMessage.includes("nutrition")) {
      return "Nutrition is crucial for fitness success! I recommend focusing on whole foods, adequate protein intake, and staying hydrated. What are your current dietary goals?";
    }

    if (lowerMessage.includes("motivation") || lowerMessage.includes("tired")) {
      return "I understand it can be challenging to stay motivated! Remember, every small step counts. Even a 10-minute workout is better than none. What's been your biggest challenge lately?";
    }

    if (lowerMessage.includes("beginner") || lowerMessage.includes("start")) {
      return "Perfect! Starting your fitness journey is exciting. I recommend beginning with 3 workouts per week, focusing on basic movements like squats, push-ups, and walking. Would you like me to create a beginner-friendly plan?";
    }

    if (
      lowerMessage.includes("weight loss") ||
      lowerMessage.includes("lose weight")
    ) {
      return "Weight loss is achieved through a combination of regular exercise and proper nutrition. I recommend a mix of cardio and strength training, along with a balanced diet. What's your current activity level?";
    }

    if (lowerMessage.includes("muscle") || lowerMessage.includes("strength")) {
      return "Building muscle requires consistent strength training and adequate protein intake. I suggest focusing on compound movements like squats, deadlifts, and bench press. How many days per week can you commit to training?";
    }

    // Default response
    return "That's a great question! As your AI fitness coach, I'm here to help you achieve your goals. Could you tell me more about what specific aspect of fitness you'd like to focus on?";
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { text: "Create workout plan", icon: "fitness" },
    { text: "Nutrition advice", icon: "restaurant" },
    { text: "Motivation tips", icon: "heart" },
    { text: "Beginner guide", icon: "school" },
  ];

  const handleQuickAction = (actionText: string) => {
    setInputText(actionText);
  };

  return (
    <SafeAreaView style={styles.container}>
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

        {/* Input Area */}
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
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  aiIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: "flex-start",
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#9512af",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  aiText: {
    color: "#333",
  },
  userText: {
    color: "white",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  aiTimestamp: {
    color: "#999",
  },
  userTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9512af",
    marginHorizontal: 2,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
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
  quickActionText: {
    fontSize: 12,
    color: "#9512af",
    marginLeft: 4,
  },
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
  sendButtonDisabled: {
    backgroundColor: "#f0f0f0",
  },
});
