// Import necessary Firebase methods and types
import { onAuthStateChanged, type User } from "firebase/auth";

// Import React hooks and types
import {
  createContext, // To create the Auth context
  useContext, // To consume the context
  useEffect, // To run side effects (e.g., listening to auth changes)
  useState, // To manage local state (user & loading)
  type ReactNode, // For typing children props
} from "react";

// Import the Firebase auth instance from your configuration
import { auth } from "../lib/firebase";

// Define the shape of the Auth context data
interface AuthContextType {
  user: User | null; // The authenticated user or null if not logged in
  loading: boolean; // Whether the auth state is still loading
}

// Create the Auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// Custom hook to easily access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext); // Get context value
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider"); // Safety check
  }
  return context;
};

// Define props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode; // Anything wrapped inside <AuthProvider>
}

// AuthProvider component that manages and provides auth state
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null); // State to store current user
  const [loading, setLoading] = useState(true); // State to track loading status

  // Set up a Firebase auth listener on mount
  useEffect(() => {
    // Listen for auth state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Update user state
      setLoading(false); // Stop loading once we know the auth state
    });

    // Cleanup listener when component unmounts
    return unsubscribe;
  }, []);

  // Provide the current user and loading state to the entire app
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
