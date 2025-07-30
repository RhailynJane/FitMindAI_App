import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "../lib/firebase";
import type { Exercise } from "./exerciseApi";

export interface UserWorkout {
  id: string;
  userId: string;
  name: string;
  exercises: WorkoutExercise[];
  createdAt: Date;
  lastUsed?: Date;
  isCustom: boolean;
  category: string;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  duration?: number;
  restTime: number;
  completed?: boolean;
}

export interface UserStats {
  userId: string;
  totalWorkouts: number;
  totalHours: number;
  currentLevel: number;
  weeklyWorkouts: number;
  lastWorkoutDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "consistency" | "strength" | "cardio" | "custom";
  duration: number; // in days
  target: number; // target value (workouts, hours, etc.)
  reward: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge: Challenge;
  progress: number;
  current: number;
  startDate: Date;
  endDate: Date;
  completed: boolean;
  joinedAt: Date;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId: string;
  workout: UserWorkout;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  exercisesCompleted: number;
  totalExercises: number;
  completed: boolean;
  createdAt: Date;
}

class FirestoreService {
  // User Workouts
  async addWorkoutToUser(
    userId: string,
    workout: Omit<UserWorkout, "id" | "userId" | "createdAt">
  ): Promise<string> {
    try {
      const workoutData = {
        ...workout,
        userId,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(firestore, "userWorkouts"),
        workoutData
      );
      return docRef.id;
    } catch (error) {
      console.error("Error adding workout:", error);
      throw error;
    }
  }

  async getUserWorkouts(userId: string): Promise<UserWorkout[]> {
    try {
      const q = query(
        collection(firestore, "userWorkouts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastUsed: doc.data().lastUsed?.toDate(),
      })) as UserWorkout[];
    } catch (error) {
      console.error("Error getting user workouts:", error);
      throw error;
    }
  }

  async deleteUserWorkout(workoutId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, "userWorkouts", workoutId));
    } catch (error) {
      console.error("Error deleting workout:", error);
      throw error;
    }
  }

  // User Stats
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const docRef = doc(firestore, "userStats", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastWorkoutDate: data.lastWorkoutDate?.toDate(),
        } as UserStats;
      }

      return null;
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  }

  async initializeUserStats(userId: string): Promise<void> {
    try {
      const statsData: Omit<UserStats, "createdAt" | "updatedAt"> = {
        userId,
        totalWorkouts: 0,
        totalHours: 0,
        currentLevel: 1,
        weeklyWorkouts: 0,
      };

      await updateDoc(doc(firestore, "userStats", userId), {
        ...statsData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      // If document doesn't exist, create it
      await addDoc(collection(firestore, "userStats"), {
        userId,
        totalWorkouts: 0,
        totalHours: 0,
        currentLevel: 1,
        weeklyWorkouts: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  async updateUserStats(
    userId: string,
    updates: Partial<UserStats>
  ): Promise<void> {
    try {
      await updateDoc(doc(firestore, "userStats", userId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user stats:", error);
      throw error;
    }
  }

  async incrementWorkoutStats(
    userId: string,
    durationMinutes: number
  ): Promise<void> {
    try {
      const statsRef = doc(firestore, "userStats", userId);
      await updateDoc(statsRef, {
        totalWorkouts: increment(1),
        totalHours: increment(durationMinutes / 60),
        weeklyWorkouts: increment(1),
        lastWorkoutDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error incrementing workout stats:", error);
      throw error;
    }
  }

  // Challenges
  async getAvailableChallenges(): Promise<Challenge[]> {
    try {
      const q = query(
        collection(firestore, "challenges"),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Challenge[];
    } catch (error) {
      console.error("Error getting challenges:", error);
      throw error;
    }
  }

  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    try {
      const q = query(
        collection(firestore, "userChallenges"),
        where("userId", "==", userId),
        orderBy("joinedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          joinedAt: data.joinedAt?.toDate() || new Date(),
        };
      }) as UserChallenge[];
    } catch (error) {
      console.error("Error getting user challenges:", error);
      throw error;
    }
  }

  async joinChallenge(userId: string, challengeId: string): Promise<string> {
    try {
      // Get challenge details
      const challengeDoc = await getDoc(
        doc(firestore, "challenges", challengeId)
      );
      if (!challengeDoc.exists()) {
        throw new Error("Challenge not found");
      }

      const challenge = {
        id: challengeDoc.id,
        ...challengeDoc.data(),
        createdAt: challengeDoc.data()?.createdAt?.toDate() || new Date(),
      } as Challenge;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + challenge.duration);

      const userChallengeData = {
        userId,
        challengeId,
        challenge,
        progress: 0,
        current: 0,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        completed: false,
        joinedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(firestore, "userChallenges"),
        userChallengeData
      );
      return docRef.id;
    } catch (error) {
      console.error("Error joining challenge:", error);
      throw error;
    }
  }

  async updateChallengeProgress(
    userChallengeId: string,
    progress: number,
    current: number
  ): Promise<void> {
    try {
      const updates: any = {
        progress,
        current,
      };

      // Check if challenge is completed
      if (progress >= 100) {
        updates.completed = true;
      }

      await updateDoc(
        doc(firestore, "userChallenges", userChallengeId),
        updates
      );
    } catch (error) {
      console.error("Error updating challenge progress:", error);
      throw error;
    }
  }

  // Workout Sessions
  async startWorkoutSession(
    userId: string,
    workoutId: string,
    workout: UserWorkout
  ): Promise<string> {
    try {
      const sessionData = {
        userId,
        workoutId,
        workout,
        startTime: serverTimestamp(),
        exercisesCompleted: 0,
        totalExercises: workout.exercises.length,
        completed: false,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(firestore, "workoutSessions"),
        sessionData
      );
      return docRef.id;
    } catch (error) {
      console.error("Error starting workout session:", error);
      throw error;
    }
  }

  async completeWorkoutSession(
    sessionId: string,
    exercisesCompleted: number
  ): Promise<void> {
    try {
      const endTime = new Date();
      const sessionRef = doc(firestore, "workoutSessions", sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.exists()) {
        const startTime = sessionDoc.data()?.startTime?.toDate() || new Date();
        const duration = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        ); // in minutes

        await updateDoc(sessionRef, {
          endTime: Timestamp.fromDate(endTime),
          duration,
          exercisesCompleted,
          completed: true,
        });

        // Update user stats
        const userId = sessionDoc.data()?.userId;
        if (userId) {
          await this.incrementWorkoutStats(userId, duration);
        }
      }
    } catch (error) {
      console.error("Error completing workout session:", error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToUserStats(
    userId: string,
    callback: (stats: UserStats | null) => void
  ) {
    const unsubscribe = onSnapshot(
      doc(firestore, "userStats", userId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastWorkoutDate: data.lastWorkoutDate?.toDate(),
          } as UserStats);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error listening to user stats:", error);
        callback(null);
      }
    );

    return unsubscribe;
  }

  subscribeToUserChallenges(
    userId: string,
    callback: (challenges: UserChallenge[]) => void
  ) {
    const q = query(
      collection(firestore, "userChallenges"),
      where("userId", "==", userId),
      orderBy("joinedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const challenges = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate() || new Date(),
            endDate: data.endDate?.toDate() || new Date(),
            joinedAt: data.joinedAt?.toDate() || new Date(),
          };
        }) as UserChallenge[];
        callback(challenges);
      },
      (error) => {
        console.error("Error listening to user challenges:", error);
        callback([]);
      }
    );

    return unsubscribe;
  }
}

export const firestoreService = new FirestoreService();
