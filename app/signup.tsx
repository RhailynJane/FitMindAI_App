// Import necessary libraries and components
import { Ionicons } from "@expo/vector-icons"; // For icons
import { useRouter } from "expo-router"; // For navigation
import { Formik } from "formik"; // Form handling library
import { useState } from "react"; // React hooks
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; // Core React Native components
import * as Yup from "yup"; // Form validation library
import { useAuthFunctions } from "../hooks/useAuthFunctions"; // Custom auth hook

// Define validation schema using Yup
const SignUpSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  acceptTerms: Yup.boolean().oneOf(
    [true],
    "You must accept the terms and conditions"
  ),
});

// Define TypeScript interface for form values
interface SignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export default function SignUp() {
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Get signUp function from auth hook
  const { signUp } = useAuthFunctions();

  // Initialize router for navigation
  const router = useRouter();

  /**
   * Handle form submission
   * @param values - Form values
   * @param param1 - Formik helpers
   */
  const handleSignUp = async (
    values: SignUpFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      // Call signUp function with form values
      await signUp(
        values.email,
        values.password,
        values.firstName,
        values.lastName
      );

      // Navigate to profile setup on success
      router.push("/profile-setup");
    } catch (error: any) {
      // Show error alert if signup fails
      Alert.alert(
        "Sign Up Failed",
        error.message || "An unknown error occurred. Please try again.",
        [{ text: "OK", onPress: () => setSubmitting(false) }]
      );
    } finally {
      // Ensure submitting state is reset
      setSubmitting(false);
    }
  };

  return (
    // SafeAreaView ensures content isn't hidden by device notches
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView prevents keyboard from covering inputs */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {/* ScrollView allows scrolling when content exceeds screen */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Ensures keyboard behaves properly
        >
          {/* Header section */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Hey there,</Text>
            <Text style={styles.title}>Create an Account</Text>
          </View>

          {/* Formik form wrapper */}
          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              acceptTerms: false,
            }}
            validationSchema={SignUpSchema}
            onSubmit={handleSignUp}
            validateOnBlur={true}
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
                {/* First Name Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9512af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="#999"
                    value={values.firstName}
                    onChangeText={handleChange("firstName")}
                    onBlur={handleBlur("firstName")}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isSubmitting}
                  />
                </View>
                {/* First Name Error */}
                {touched.firstName && errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}

                {/* Last Name Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9512af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="#999"
                    value={values.lastName}
                    onChangeText={handleChange("lastName")}
                    onBlur={handleBlur("lastName")}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isSubmitting}
                  />
                </View>
                {/* Last Name Error */}
                {touched.lastName && errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#9512af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSubmitting}
                  />
                </View>
                {/* Email Error */}
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9512af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!isSubmitting}
                  />
                  {/* Password Visibility Toggle */}
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {/* Password Error */}
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {/* Password Requirements Hint */}
                <Text style={styles.passwordHint}>
                  Password must be at least 6 characters
                </Text>

                {/* Terms Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() =>
                    setFieldValue("acceptTerms", !values.acceptTerms)
                  }
                  disabled={isSubmitting}
                >
                  <View
                    style={[
                      styles.checkbox,
                      values.acceptTerms && styles.checkedCheckbox,
                    ]}
                  >
                    {values.acceptTerms && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    By continuing you accept our Privacy Policy and Term of Use
                  </Text>
                </TouchableOpacity>
                {/* Terms Error */}
                {touched.acceptTerms && errors.acceptTerms && (
                  <Text style={styles.errorText}>{errors.acceptTerms}</Text>
                )}

                {/* Register Button */}
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    isSubmitting && styles.disabledButton,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.registerButtonText}>Register</Text>
                  )}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/signin")}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.signInLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  // Main container style
  container: {
    flex: 1,
    backgroundColor: "#efdff1", // Light purple background
  },

  // ScrollView content container
  scrollContent: {
    flexGrow: 1, // Allows content to expand
    paddingHorizontal: 30, // Horizontal padding
    paddingTop: 60, // Top padding
    paddingBottom: 40, // Bottom padding
  },

  // Header styles
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  // Form container
  form: {
    marginBottom: 30,
  },

  // Input container styles
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8f8", // Light gray background
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
  eyeIcon: {
    padding: 5,
  },

  // Error text style
  errorText: {
    color: "#ff4444", // Red color for errors
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 15,
    marginTop: -10, // Pull error closer to input
  },

  // Password hint text
  passwordHint: {
    color: "#666",
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 15,
  },

  // Checkbox styles
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedCheckbox: {
    backgroundColor: "#9512af", // Purple when checked
    borderColor: "#9512af",
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },

  // Register button styles
  registerButton: {
    backgroundColor: "#9512af", // Purple button
    borderRadius: 25,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#9512af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },
  disabledButton: {
    opacity: 0.7, // Dim when disabled
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Sign in link styles
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    color: "#666",
    fontSize: 14,
  },
  signInLink: {
    color: "#c58bf2", // Light purple link
    fontSize: 14,
    fontWeight: "600",
  },
});
