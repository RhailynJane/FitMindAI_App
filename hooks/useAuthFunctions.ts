// Marks this file as a client-side module in Next.js or Expo Router
"use client";

// Firebase auth methods for user management
import {
  createUserWithEmailAndPassword, // To create a new user account
  signInWithEmailAndPassword, // To log in an existing user
  signOut, // To sign out the current user
  updateProfile, // To update user profile info like display name
} from "firebase/auth";

// Firestore methods to read/write documents
import { doc, getDoc, setDoc } from "firebase/firestore";

// React hook for managing component state
import { useState } from "react";

// Import initialized Firebase Auth and Firestore instances
import { auth, db } from "../lib/firebase";

// Define the structure of a user profile stored in Firestore
export interface UserProfile {
  uid: string; // Unique user ID from Firebase Auth
  email: string; // User's email address
  firstName: string; // First name (from sign-up form)
  lastName: string; // Last name (from sign-up form)
  displayName: string; // Full display name (combined first + last name)
  createdAt: Date; // Timestamp of account creation
  updatedAt: Date; // Timestamp of last update
}

// Custom hook that provides authentication-related functions
export const useAuthFunctions = () => {
  // Local loading state to track async operations
  const [loading, setLoading] = useState(false);

  // Function to create a new user account
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setLoading(true); // Show loading indicator

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Set user's display name to "First Last"
      const displayName = `${firstName} ${lastName}`;
      await updateProfile(user, { displayName });

      // Prepare a new user profile document
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        firstName,
        lastName,
        displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save user profile in Firestore under "users/{uid}"
      await setDoc(doc(db, "users", user.uid), userProfile);

      // Return the user object on success
      return user;
    } catch (error: any) {
      // Log and re-throw error with user-friendly message
      console.error("Sign up error:", error);
      throw new Error(error.message || "Failed to create account");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Function to log in an existing user
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true); // Show loading while signing in

      // Authenticate user using Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Return the authenticated user
      return userCredential.user;
    } catch (error: any) {
      // Log and re-throw sign-in error
      console.error("Sign in error:", error);
      throw new Error(error.message || "Failed to sign in");
    } finally {
      setLoading(false); // Hide loading
    }
  };

  // Function to log the user out
  const logout = async () => {
    try {
      setLoading(true); // Show loading while logging out

      // Sign out from Firebase Auth
      await signOut(auth);
    } catch (error: any) {
      // Log and re-throw logout error
      console.error("Logout error:", error);
      throw new Error(error.message || "Failed to logout");
    } finally {
      setLoading(false); // Hide loading
    }
  };

  // Function to fetch a user's profile from Firestore
  const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      // Get the user document from Firestore
      const userDoc = await getDoc(doc(db, "users", uid));

      // If it exists, cast and return it as a UserProfile
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }

      // Return null if no profile was found
      return null;
    } catch (error) {
      // Log error and return null
      console.error("Error getting user profile:", error);
      return null;
    }
  };

  // Return all auth functions and loading state
  return {
    signUp,
    signIn,
    logout,
    getUserProfile,
    loading,
  };
};
