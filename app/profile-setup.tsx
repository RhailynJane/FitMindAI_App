import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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
import * as Yup from "yup";
import { useAuthFunctions } from "../hooks/useAuthFunctions";
import { auth } from "../lib/firebase";

const { width } = Dimensions.get("window");

const ProfileSetupSchema = Yup.object().shape({
  gender: Yup.string().required("Please select your gender"),
  dateOfBirth: Yup.string().required("Date of birth is required"),
  weight: Yup.number()
    .min(30, "Weight must be at least 30 kg")
    .max(300, "Weight must be less than 300 kg")
    .required("Weight is required"),
  height: Yup.number()
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must be less than 250 cm")
    .required("Height is required"),
});

interface ProfileSetupFormValues {
  gender: string;
  dateOfBirth: string;
  weight: string;
  height: string;
}

const genderOptions = ["Male", "Female", "Other"];

export default function ProfileSetup() {
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();
  const { updateUserProfile } = useAuthFunctions();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const handleProfileSetup = async (values: ProfileSetupFormValues) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Prepare profile data
      const profileData = {
        gender: values.gender,
        birthday: values.dateOfBirth,
        weight: parseFloat(values.weight),
        height: parseFloat(values.height),
      };

      // Update user profile in database
      await updateUserProfile(user.uid, profileData);

      console.log("Profile data saved:", profileData);
      router.push("/goal-selection");
    } catch (error: any) {
      Alert.alert("Profile Setup Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: "/placeholder.svg?height=200&width=200" }}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Lets complete your profile</Text>
            <Text style={styles.subtitle}>
              It will help us to know more about you!
            </Text>
          </View>

          <Formik
            initialValues={{
              gender: "",
              dateOfBirth: "",
              weight: "",
              height: "",
            }}
            validationSchema={ProfileSetupSchema}
            onSubmit={handleProfileSetup}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
              setFieldValue,
            }) => (
              <View style={styles.form}>
                {/* Gender Picker */}
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowGenderPicker(!showGenderPicker)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9512af"
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[styles.input, !values.gender && styles.placeholder]}
                  >
                    {values.gender || "Choose Gender"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                {touched.gender && errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
                {showGenderPicker && (
                  <View style={styles.pickerContainer}>
                    {genderOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.pickerOption}
                        onPress={() => {
                          setFieldValue("gender", option);
                          setShowGenderPicker(false);
                        }}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.pickerOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Date Picker */}
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#9512af"
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.input,
                      !values.dateOfBirth && styles.placeholder,
                    ]}
                  >
                    {values.dateOfBirth || "Date of Birth"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                )}
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, date) => {
                      setShowDatePicker(Platform.OS === "ios");
                      if (date) {
                        setSelectedDate(date);
                        setFieldValue("dateOfBirth", formatDate(date));
                      }
                    }}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}

                {/* Weight Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="fitness-outline"
                    size={20}
                    color="#9512af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Your Weight"
                    placeholderTextColor="#999"
                    value={values.weight}
                    onChangeText={handleChange("weight")}
                    onBlur={handleBlur("weight")}
                    keyboardType="numeric"
                  />
                  <View style={styles.unitContainer}>
                    <Text style={styles.unitText}>KG</Text>
                  </View>
                </View>
                {touched.weight && errors.weight && (
                  <Text style={styles.errorText}>{errors.weight}</Text>
                )}

                {/* Height Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="resize-outline"
                    size={20}
                    color="#9512af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Your Height"
                    placeholderTextColor="#999"
                    value={values.height}
                    onChangeText={handleChange("height")}
                    onBlur={handleBlur("height")}
                    keyboardType="numeric"
                  />
                  <View style={styles.unitContainer}>
                    <Text style={styles.unitText}>CM</Text>
                  </View>
                </View>
                {touched.height && errors.height && (
                  <Text style={styles.errorText}>{errors.height}</Text>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    isSubmitting && styles.disabledButton,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.nextButtonText}>Next</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="white"
                        style={styles.buttonIcon}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... (keep your existing styles unchanged)

// Stylesheet
const styles = StyleSheet.create({
  // Main container style
  container: {
    flex: 1,
    backgroundColor: "#efdff1", // Light purple background
  },

  // ScrollView content container
  scrollContent: {
    paddingHorizontal: 30, // Horizontal padding
    paddingTop: 40, // Top padding
    paddingBottom: 40, // Bottom padding
  },

  // Image container
  imageContainer: {
    alignItems: "center", // Center horizontally
    marginBottom: 30, // Space below image
  },

  // Profile image
  heroImage: {
    width: width * 0.6, // Responsive width (60% of screen)
    height: width * 0.4, // Responsive height
  },

  // Text container
  textContainer: {
    alignItems: "center", // Center horizontally
    marginBottom: 40, // Space below text
  },

  // Title text
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333", // Dark text
    marginBottom: 8, // Space below title
  },

  // Subtitle text
  subtitle: {
    fontSize: 14,
    color: "#666", // Gray text
  },

  // Form container
  form: {
    flex: 1, // Take up available space
  },

  // Input container
  inputContainer: {
    flexDirection: "row", // Horizontal layout
    alignItems: "center", // Center vertically
    backgroundColor: "#f7f8f8", // Light gray background
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 60,
  },

  // Input icon
  inputIcon: {
    marginRight: 15, // Space between icon and input
  },

  // Input field
  input: {
    flex: 1, // Take up remaining space
    fontSize: 16,
    color: "#333", // Dark text
  },

  // Placeholder text
  placeholder: {
    color: "#999", // Light gray text
  },

  // Unit container (KG/CM)
  unitContainer: {
    backgroundColor: "#c58bf2", // Light purple background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  // Unit text
  unitText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600", // Semi-bold
  },

  // Error text
  errorText: {
    color: "#ff4444", // Red color
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 15,
  },

  // Picker container (gender options)
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },

  // Picker option (gender)
  pickerOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0", // Light gray border
  },

  // Picker option text
  pickerOptionText: {
    fontSize: 16,
    color: "#333", // Dark text
  },

  // Next button
  nextButton: {
    backgroundColor: "#9512af", // Purple button
    borderRadius: 25,
    height: 60,
    flexDirection: "row", // Horizontal layout
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },

  // Disabled button state
  disabledButton: {
    opacity: 0.7, // Dim when disabled
  },

  // Next button text
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600", // Semi-bold
    marginRight: 8, // Space between text and icon
  },

  // Button icon
  buttonIcon: {
    marginLeft: 4, // Space between text and icon
  },
});
