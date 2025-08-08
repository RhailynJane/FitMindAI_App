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
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

// Get screen width for responsive design
const { width } = Dimensions.get("window");

// Validation schema for form inputs using Yup
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

// Define the shape of the form values
interface ProfileSetupFormValues {
  gender: string;
  dateOfBirth: string;
  weight: string;
  height: string;
}

// Options for gender selection
const genderOptions = ["Male", "Female", "Other"];

export default function ProfileSetup() {
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();

  // Submit handler for profile setup form
  const handleProfileSetup = async (values: ProfileSetupFormValues) => {
    try {
      // Simulate saving data
      console.log("Profile data:", values);
      router.push("/goal-selection"); // Navigate to next screen
    } catch (error: any) {
      Alert.alert("Profile Setup Failed", error.message);
    }
  };

  // Format date to locale string for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "/placeholder.svg?height=200&width=200" }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Heading and subheading */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Lets complete your profile</Text>
          <Text style={styles.subtitle}>
            It will help us to know more about you!
          </Text>
        </View>

        {/* Form using Formik */}
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
              {/* Gender Picker Input */}
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowGenderPicker(!showGenderPicker)}
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

              {/* Gender Options */}
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
      </View>
    </SafeAreaView>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efdff1",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  heroImage: {
    width: width * 0.6,
    height: width * 0.4,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8f8",
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 60,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  placeholder: {
    color: "#999",
  },
  unitContainer: {
    backgroundColor: "#c58bf2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unitText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 15,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pickerOptionText: {
    fontSize: 16,
    color: "#333",
  },
  nextButton: {
    backgroundColor: "#9512af",
    borderRadius: 25,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    marginBottom: 40,
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});
