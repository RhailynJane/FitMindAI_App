import { Ionicons } from "@expo/vector-icons"; // Importing icon library for visual error indicator
import React from "react"; // Import React to use class components and JSX
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Core React Native components for UI

// Props definition for the ErrorBoundary component
interface ErrorBoundaryProps {
  children: React.ReactNode; // React children nodes to render inside the boundary
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>; // Optional fallback component to display on error
}

// Internal state of the error boundary
interface ErrorBoundaryState {
  hasError: boolean; // Flag to check if an error has occurred
  error: Error | null; // Captured error object
}

// ErrorBoundary class component to catch JavaScript errors in child components
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  // Constructor initializes state
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null }; // Default: no error
  }

  // Static method to update state when an error is thrown
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }; // Update state to show fallback UI
  }

  // Lifecycle method to log the error for debugging
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo); // Log error details
  }

  // Retry function to reset error state and try rendering children again
  retry = () => {
    this.setState({ hasError: false, error: null }); // Reset state
  };

  // Render method to display fallback UI if error occurs, else render children
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback; // Use custom or default fallback
      return <FallbackComponent error={this.state.error!} retry={this.retry} />; // Show fallback
    }

    return this.props.children; // No error: render children
  }
}

// Default fallback UI if no custom fallback is provided
function DefaultErrorFallback({
  error,
  retry,
}: {
  error: Error; // Error object passed from boundary
  retry: () => void; // Retry handler passed from boundary
}) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={48} color="#ff4444" />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles used in the default fallback UI
const styles = StyleSheet.create({
  container: {
    flex: 1, // Fill the entire screen
    justifyContent: "center", // Vertically center content
    alignItems: "center", // Horizontally center content
    padding: 20,
    backgroundColor: "#f8f9fa", // Light neutral background
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333", // Dark gray
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#666", // Medium gray
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#9512af", // Purple button background
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "white", // White text on button
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ErrorBoundary; // Export component for use in app
