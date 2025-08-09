// Importing required modules and components
import { Ionicons } from "@expo/vector-icons"; // Icon library for the forward arrow
import { useRouter } from "expo-router"; // Used for navigation between screens
import { useRef, useState } from "react"; // React hooks for state and references
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"; // Core React Native components

// Get the screen dimensions for responsive layout
const { width, height } = Dimensions.get("window");

// Define the type for each onboarding slide
interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image: any; // Image object loaded via require()
}

// Data for the onboarding slides
const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    title: "Track Your Goal",
    description:
      "Struggling to identify your goals?\nWe'll guide you through the process and\nhelp you stay on track.",
    image: require("../assets/images/onboarding/track-goal.png"),
  },
  {
    id: 2,
    title: "Get Burn",
    description:
      "Keep the fire alive — reaching your goals may hurt,\nbut that pain won't last.\nGiving up, though, leaves a lasting wound.",
    image: require("../assets/images/onboarding/get-burn.png"),
  },
  {
    id: 3,
    title: "AI-Powered Fitness",
    description:
      "Your AI-powered fitness companion that adapts to your lifestyle.\nGet personalized workouts and achieve your fitness goals.",
    image: require("../assets/images/onboarding/ai-fitness.png"),
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0); // Keeps track of the current slide index
  const scrollViewRef = useRef<ScrollView>(null); // Ref to control the ScrollView
  const router = useRouter(); // Router object for navigation

  // Navigate to the next slide or push to signup on the last slide
  const nextSlide = () => {
    if (currentSlide < onboardingData.length - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width, // Scroll to the next slide position
        animated: true,
      });
    } else {
      // Navigate to signup page when the last slide is reached
      router.push("/signup");
    }
  };

  // Updates the current slide index on scroll
  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main wrapper for content */}
      <View style={styles.content}>
        {/* Horizontal scrollable slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled // Snaps to each slide
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.scrollView}
        >
          {onboardingData.map((slide, index) => (
            <View key={slide.id} style={styles.slide}>
              {/* Image section */}
              <View style={styles.imageContainer}>
                <View style={styles.imageCircle}>
                  <Image
                    source={slide.image}
                    style={styles.slideImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Title and description */}
              <View style={styles.textContainer}>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideDescription}>{slide.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination dots */}
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

        {/* Next button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Styling for components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
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
    paddingTop: 40,
    alignItems: "center",
  },
  imageContainer: {
    flex: 0.5, // Takes half the screen vertically
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imageCircle: {
    width: width * 0.9,
    height: width * 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Semi-transparent white background
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Clip image within circle
  },
  slideImage: {
    width: "90%",
    height: "90%",
  },
  textContainer: {
    flex: 0.5, // Remaining half for text
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
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
    width: 20, // Make active dot wider
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
    backgroundColor: "#9512af", // Primary button color
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },
});
