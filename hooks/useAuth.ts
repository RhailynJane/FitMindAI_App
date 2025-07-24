import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener...");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        "Auth state changed:",
        user ? `User: ${user.email}` : "No user"
      );
      setUser(user);
      setLoading(false);
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  return { user, loading };
};

export default useAuth;
