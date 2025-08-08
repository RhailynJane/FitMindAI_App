// hooks/useAuthFunctions.ts
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  User,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
  fitnessGoals?: string[];
  notifications?: {
    master: boolean;
    settings: {
      id: string;
      title: string;
      description: string;
      icon: string;
      enabled: boolean;
    }[];
  };
}

export const useAuthFunctions = () => {
  const [loading, setLoading] = useState(false);

  /** Sign up new user */
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const displayName = `${firstName} ${lastName}`;
      await updateProfile(user, { displayName });

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        firstName,
        lastName,
        displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "users", user.uid), userProfile);
      return user;
    } finally {
      setLoading(false);
    }
  };

  /** Sign in */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  /** Logout */
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      router.replace("/signin"); // navigate to sign-in screen
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Change password */
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error("No authenticated user found");
    }
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPassword);
      console.log("Password updated successfully");
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw new Error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  /** Delete account (no password check, full name confirmation in UI) */
  const deleteAccount = async (uid: string, user: User) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(user);
      console.log("Account deleted successfully");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      throw new Error(error.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  /** Get user profile */
  const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : new Date(data.updatedAt),
      } as UserProfile;
    }
    return null;
  };

  /** Update user profile */
  const updateUserProfile = async (
    uid: string,
    profileData: Partial<UserProfile>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const updateData = {
        ...profileData,
        updatedAt: new Date(),
      };
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(
          ([key, value]) => value !== undefined && key !== "uid"
        )
      );
      await updateDoc(doc(db, "users", uid), cleanUpdateData);
      return true;
    } finally {
      setLoading(false);
    }
  };

  /** Validate profile fields */
  const validateProfileData = (profileData: Partial<UserProfile>): string[] => {
    const errors: string[] = [];
    if (profileData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        errors.push("Invalid email format");
      }
    }
    if (profileData.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(profileData.phone)) {
        errors.push("Invalid phone number format");
      }
    }
    return errors;
  };

  return {
    signUp,
    signIn,
    logout,
    changePassword,
    getUserProfile,
    updateUserProfile,
    deleteAccount,
    validateProfileData,
    loading,
  };
};
