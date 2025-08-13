// Import necessary libraries and components
import { Ionicons } from "@expo/vector-icons"; // For icons
import { useRouter } from "expo-router"; // For navigation
import { Formik } from "formik"; // Form handling library
import { useState } from "react"; // React hooks
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; // Core React Native components
import * as Yup from "yup"; // Form validation library
import { useAuthFunctions } from "../hooks/useAuthFunctions"; // Custom auth hook

// Define validation schema using Yup
const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

// Define TypeScript interface for form values
interface SignInFormValues {
  email: string;
  password: string;
}

export default function SignIn() {
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Get auth functions from custom hook
  const { signIn, resetPassword } = useAuthFunctions();

  // Initialize router for navigation
  const router = useRouter();

  /**
   * Handle form submission
   * @param values - Form values containing email and password
   */
  const handleSignIn = async (values: SignInFormValues) => {
    try {
      // Call signIn function with form values
      await signIn(values.email, values.password);

      // Navigate to welcome success screen on successful login
      router.push("/welcome-success");
    } catch (error: any) {
      // Show error alert if login fails
      Alert.alert("Sign In Failed", error.message);
    }
  };

  /**
   * Handle password reset request
   * @param email - Email address to send reset link to
   */
  const handleForgotPassword = async (email: string) => {
    // Validate email was entered
    if (!email) {
      Alert.alert(
        "Enter Email",
        "Please enter your email address so we can send you a reset link."
      );
      return;
    }

    try {
      // Call resetPassword function
      await resetPassword(email);

      // Show success message
      Alert.alert("Success", "Password reset email sent. Check your inbox.");
    } catch (error: any) {
      // Show error if password reset fails
      Alert.alert("Error", error.message);
    }
  };

  return (
    // SafeAreaView ensures content isn't hidden by device notches
    <SafeAreaView style={styles.container}>
      {/* Main content container */}
      <View style={styles.content}>
        {/* Header section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey there,</Text>
          <Text style={styles.title}>Welcome Back</Text>
        </View>

        {/* Formik form wrapper */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={SignInSchema}
          onSubmit={handleSignIn}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#9512af" // Purple icon color
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999" // Gray placeholder text
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting} // Disable during submission
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
                  color="#9512af" // Purple icon color
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999" // Gray placeholder text
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry={!showPassword} // Toggle password visibility
                  autoCapitalize="none"
                  editable={!isSubmitting} // Disable during submission
                />
                {/* Password Visibility Toggle */}
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting} // Disable during submission
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666" // Gray icon color
                  />
                </TouchableOpacity>
              </View>
              {/* Password Error */}
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => handleForgotPassword(values.email)}
                disabled={isSubmitting} // Disable during submission
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isSubmitting && styles.disabledButton, // Dim when loading
                ]}
                onPress={() => handleSubmit()}
                disabled={isSubmitting}
                activeOpacity={0.8} // Button press effect
              >
                {isSubmitting ? (
                  // Show loading indicator during submission
                  <ActivityIndicator color="white" />
                ) : (
                  // Show login text and icon when not loading
                  <>
                    <Ionicons
                      name="log-in-outline"
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.loginButtonText}>Login</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Dont have an account yet?</Text>
                <TouchableOpacity
                  onPress={() => router.push("/signup")}
                  disabled={isSubmitting} // Disable during submission
                >
                  <Text style={styles.signUpLink}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </View>
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

  // Content container
  content: {
    flex: 1,
    paddingHorizontal: 30, // Horizontal padding
    paddingTop: 80, // Top padding
    justifyContent: "center", // Center content vertically
  },

  // Header styles
  header: {
    marginBottom: 60, // Space below header
    alignItems: "center", // Center header content
  },
  greeting: {
    fontSize: 16,
    color: "#666", // Gray text
    marginBottom: 5, // Space below greeting
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333", // Dark text
  },

  // Form container
  form: {
    flex: 1, // Take up available space
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
    marginRight: 15, // Space between icon and input
  },
  input: {
    flex: 1, // Take up remaining space
    fontSize: 16,
    color: "#333", // Dark text
  },
  eyeIcon: {
    padding: 5, // Touchable area for eye icon
  },

  // Error text style
  errorText: {
    color: "#ff4444", // Red color for errors
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 15,
  },

  // Forgot password link styles
  forgotPassword: {
    alignSelf: "center", // Center horizontally
    marginTop: 10,
    marginBottom: 40, // Space above button
  },
  forgotPasswordText: {
    color: "#c58bf2", // Light purple link
    fontSize: 13,
    textDecorationLine: "underline", // Underline link
  },

  // Login button styles
  loginButton: {
    backgroundColor: "#9512af", // Purple button
    borderRadius: 25,
    height: 60,
    flexDirection: "row", // Icon and text in row
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#9512af", // Shadow matches button color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },
  disabledButton: {
    opacity: 0.7, // Dim when disabled
  },
  buttonIcon: {
    marginRight: 10, // Space between icon and text
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600", // Semi-bold
  },

  // Sign up link styles
  signUpContainer: {
    flexDirection: "row", // Text and link in row
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto", // Push to bottom
    marginBottom: 40, // Space from bottom
  },
  signUpText: {
    color: "#666", // Gray text
    fontSize: 14,
  },
  signUpLink: {
    color: "#c58bf2", // Light purple link
    fontSize: 14,
    fontWeight: "600", // Semi-bold
  },
});
