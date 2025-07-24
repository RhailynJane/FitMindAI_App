"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PlaceholderImage } from "../components/PlaceholderImage";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  imageName: string;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    title: "Track Your Goal",
    description:
      "Struggling to identify your goals?\nWe'll guide you through the process and\nhelp you stay on track.",
    imageName: "Track Goal",
  },
  {
    id: 2,
    title: "Get Burn",
    description:
      "Keep the fire alive — reaching your goals may hurt,\nbut that pain won't last.\nGiving up, though, leaves a lasting wound.",
    imageName: "Get Burn",
  },
  {
    id: 3,
    title: "AI-Powered Fitness",
    description:
      "Your AI-powered fitness companion that adapts to your lifestyle.\nGet personalized workouts and achieve your fitness goals.",
    imageName: "AI Fitness",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const nextSlide = () => {
    if (currentSlide < onboardingData.length - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      // Last slide, go directly to signup
      router.push("/signup");
    }
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.scrollView}
        >
          {onboardingData.map((slide, index) => (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.imageContainer}>
                <View style={styles.imageCircle}>
                  <PlaceholderImage
                    width={width * 0.6}
                    height={width * 0.4}
                    text={slide.imageName}
                    style={styles.slideImage}
                  />
                </View>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideDescription}>{slide.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlide && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efdff1",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  imageCircle: {
    width: width * 0.8,
    height: width * 0.6,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  slideImage: {
    borderRadius: (width * 0.6) / 2,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 100, // Space for pagination and button
    minHeight: 120, // Ensure consistent height
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  slideDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(149, 18, 175, 0.3)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#9512af",
    width: 20,
  },
  buttonContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#9512af",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
