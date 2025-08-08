// Import icon library for UI icons
import { Ionicons } from "@expo/vector-icons";

// Expo Router for navigation
import { useRouter } from "expo-router";

// Formik handles form state and validation
import { Formik } from "formik";

// useState for local state management
import { useState } from "react";

// React Native components
import {
  ActivityIndicator, // shows loading spinner
  Alert, // shows alert dialogs
  SafeAreaView, // avoids unsafe screen areas
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Yup is used to define form validation schema
import * as Yup from "yup";

// Custom hook to handle auth actions (sign in, sign out, etc.)
import { useAuthFunctions } from "../hooks/useAuthFunctions";

// Validation schema using Yup
const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address") // Validates proper email format
    .required("Email is required"), // Field is required
  password: Yup.string()
    .min(6, "Password must be at least 6 characters") // Minimum length check
    .required("Password is required"),
});

// TypeScript interface to define shape of form values
interface SignInFormValues {
  email: string;
  password: string;
}

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false); // Toggle visibility of password field
  const { signIn } = useAuthFunctions(); // Get signIn function from auth hook
  const router = useRouter(); // Router to navigate to other screens

  // Function to handle sign-in logic
  const handleSignIn = async (values: SignInFormValues) => {
    try {
      await signIn(values.email, values.password); // Attempt to sign in with provided credentials
      router.push("/welcome-success"); // Redirect on successful login
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message); // Show error if login fails
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header text */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey there,</Text>
          <Text style={styles.title}>Welcome Back</Text>
        </View>

        {/* Formik manages form values and validation */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={SignInSchema} // Apply Yup validation
          onSubmit={handleSignIn} // Submit handler
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
              {/* Email Input Field */}
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
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {/* Email validation error */}
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* Password Input Field */}
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
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                {/* Toggle password visibility */}
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {/* Password validation error */}
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Forgot Password Link */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isSubmitting && styles.disabledButton,
                ]}
                onPress={() => handleSubmit()} // Trigger form submit
                disabled={isSubmitting} // Disable button when submitting
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
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

              {/* Redirect to Sign Up Screen */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Dont have an account yet?</Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
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

// StyleSheet for styling all components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efdff1", // Light lavender background
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    justifyContent: "center", // Vertically center content
  },
  header: {
    marginBottom: 60,
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
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: "#ff4444", // Red color for validation error
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 15,
  },
  forgotPassword: {
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  forgotPasswordText: {
    color: "#c58bf2",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#9512af", // Primary purple color
    borderRadius: 25,
    height: 60,
    flexDirection: "row",
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
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 10,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 40,
  },
  signUpText: {
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#c58bf2",
    fontSize: 14,
    fontWeight: "600",
  },
});
