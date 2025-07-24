"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../lib/firebase";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  fitnessGoal?: string;
  fitnessLevel?: string;
  workoutFrequency?: string;
  createdAt: Date;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const retryOperation = async (
  operation: () => Promise<any>,
  maxRetries = 3,
  delayMs = 1000
): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      await delay(delayMs * (i + 1)); // Exponential backoff
    }
  }
  throw new Error("Max retries exceeded");
};

export const useAuthFunctions = () => {
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<User> => {
    try {
      console.log("Creating user account with email:", email);
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User created successfully with ID:", user.uid);

      // Update display name
      console.log(
        "Updating user profile with name:",
        `${firstName} ${lastName}`
      );
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
      console.log("User display name updated successfully");

      // Create user profile in Firestore with retry logic
      const userProfile: UserProfile = {
        id: user.uid,
        firstName,
        lastName,
        email,
        createdAt: new Date(),
      };

      console.log("Creating user profile in Firestore...");
      await retryOperation(() => {
        return setDoc(doc(firestore, "users", user.uid), userProfile);
      });
      console.log("User profile created successfully in Firestore");

      return user;
    } catch (error: any) {
      console.error("Sign up error:", error.code, error.message);

      // Provide more user-friendly error messages
      let errorMessage = error.message;
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please use a different email or try signing in.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (
        error.message.includes("Firestore") ||
        error.message.includes("transport")
      ) {
        errorMessage =
          "There was an issue saving your profile. Your account was created successfully. Please try signing in.";
      }

      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      console.log("Signing in user with email:", email);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in successfully:", user.uid);
      return user;
    } catch (error: any) {
      console.error("Sign in error:", error.code, error.message);

      let errorMessage = error.message;
      if (error.code === "auth/user-not-found") {
        errorMessage =
          "No account found with this email. Please check your email or create a new account.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("Signing out user...");
      await signOut(auth);
      console.log("User signed out successfully");
    } catch (error: any) {
      console.error("Sign out error:", error.code, error.message);
      throw error;
    }
  };

  const getUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      console.log("Fetching user profile for ID:", userId);
      const userDoc = await retryOperation(() => {
        return getDoc(doc(firestore, "users", userId));
      });

      if (userDoc.exists()) {
        console.log("User profile found");
        return userDoc.data() as UserProfile;
      }
      console.log("No user profile found");
      return null;
    } catch (error: any) {
      console.error("Get user profile error:", error.code, error.message);
      throw error;
    }
  };

  const updateUserProfile = async (
    userId: string,
    profileData: Partial<UserProfile>
  ): Promise<void> => {
    try {
      console.log("Updating user profile for ID:", userId);
      await retryOperation(() => {
        return setDoc(doc(firestore, "users", userId), profileData, {
          merge: true,
        });
      });
      console.log("User profile updated successfully");
    } catch (error: any) {
      console.error("Update user profile error:", error.code, error.message);
      throw error;
    }
  };

  return {
    signUp,
    signIn,
    logout,
    getUserProfile,
    updateUserProfile,
  };
};

export default useAuthFunctions;
