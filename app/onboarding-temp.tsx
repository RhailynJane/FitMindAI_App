import { Ionicons } from "@expo/vector-icons"; // Import icon set from Expo (Ionicons used for navigation arrow)
import { useRouter } from "expo-router"; // Router hook for programmatic navigation
import { useRef, useState } from "react"; // React hooks for managing state and references
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"; // Core React Native components

import { PlaceholderImage } from "../components/PlaceholderImage"; // Custom component to show placeholder images

// Get the screen width and height for responsive layout
const { width, height } = Dimensions.get("window");

// Define the shape of each onboarding slide
interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  imageName: string;
}

// Onboarding slide data
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
  const [currentSlide, setCurrentSlide] = useState(0); // State to track the current slide index
  const scrollViewRef = useRef<ScrollView>(null); // Reference to control ScrollView programmatically
  const router = useRouter(); // Router object for screen navigation

  // Function to go to the next slide or navigate to signup after the last one
  const nextSlide = () => {
    if (currentSlide < onboardingData.length - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex); // Update current slide state
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width, // Scroll to the next slide
        animated: true, // Smooth animation
      });
    } else {
      // If on last slide, redirect to signup screen
      router.push("/signup");
    }
  };

  // Handle manual scroll (swipe) and update slide index accordingly
  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Ensures content stays within safe bounds (notches, status bar) */}
      <View style={styles.content}>
        <ScrollView
          ref={scrollViewRef} // Assign ref for programmatic scrolling
          horizontal // Enable horizontal swiping
          pagingEnabled // Snap scroll to full pages
          showsHorizontalScrollIndicator={false} // Hide scroll bar
          onMomentumScrollEnd={handleScroll} // Detect when user finishes a swipe
          style={styles.scrollView}
        >
          {/* Render each onboarding slide */}
          {onboardingData.map((slide, index) => (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.imageContainer}>
                <View style={styles.imageCircle}>
                  <PlaceholderImage
                    width={width * 0.6} // Responsive image width
                    height={width * 0.4} // Responsive image height
                    text={slide.imageName} // Label shown in image
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

        {/* Pagination dots at the bottom */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlide && styles.paginationDotActive, // Highlight current dot
              ]}
            />
          ))}
        </View>

        {/* Next button to go to next slide or signup */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Stylesheet for the onboarding screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efdff1", // Light purple background
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width, // Full screen width
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
    borderRadius: (width * 0.8) / 2, // Make it circular
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Transparent white background
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Clip image to circle
  },
  slideImage: {
    borderRadius: (width * 0.6) / 2,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 100, // Room for pagination + button
    minHeight: 120,
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
    backgroundColor: "rgba(149, 18, 175, 0.3)", // Inactive dot color
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#9512af", // Active dot color
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
    backgroundColor: "#9512af", // Purple background
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
