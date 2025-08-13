import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  arrayUnion as fbArrayUnion,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";

// Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "consistency" | "strength" | "cardio" | "transformation";
  duration: number;
  target: number;
  reward: string;
  xpReward: number;
  isActive: boolean;
  createdAt: Date;
}

export interface AIChallenge extends Challenge {
  isAI: boolean;
  generatedAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge: Challenge;
  startDate: Date;
  endDate: Date;
  current: number;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

export interface UserStats {
  userId: string;
  totalWorkouts: number;
  weeklyWorkouts: number;
  totalHours: number;
  currentLevel: number;
  totalXP: number;
  lastWorkoutDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExercise {
  exercise: {
    id: string;
    name: string;
    bodyPart: string;
    target: string;
    equipment: string;
    gifUrl: string;
    instructions: string[];
    secondaryMuscles: string[];
    difficulty: string;
    category: string;
    description: string;
  };
  sets: number;
  reps: number;
  duration: number | null;
  restTime: number;
}

export interface UserWorkout {
  id: string;
  userId: string;
  name: string;
  exercises: WorkoutExercise[];
  isCustom: boolean;
  category: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId: string;
  workout: UserWorkout;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  duration?: number;
}

export interface UserProfile {
  fitnessLevel?: string;
  goals?: string[];
  equipment?: string[];
  availableTime?: string;
  completedChallenges?: string[];
  preferredTypes?: string[];
  experiencePoints?: number;
}

// Helper function to remove undefined values from objects
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter((item) => item !== undefined);
  }

  if (
    typeof obj === "object" &&
    !(obj instanceof Date) &&
    !(obj instanceof Timestamp)
  ) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeUndefined(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }

  return obj;
}

// Helper function to safely convert Firestore timestamps to dates
function safeToDate(timestamp: any): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return undefined;
}

class FirestoreService {
  // User Profile Methods
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userProfileRef = doc(db, "userProfiles", uid);
      const docSnap = await getDoc(userProfileRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          fitnessLevel: data.fitnessLevel,
          goals: data.goals || [],
          equipment: data.equipment || [],
          availableTime: data.availableTime,
          completedChallenges: data.completedChallenges || [],
          preferredTypes: data.preferredTypes || [],
          experiencePoints: data.experiencePoints || 0,
        } as UserProfile;
      }

      // Fallback to user document if profile doesn't exist
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          fitnessLevel: data?.fitnessLevel,
          goals: data?.goals || [],
          equipment: data?.equipment || [],
          availableTime: data?.availableTime,
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  async saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
    try {
      const userProfileRef = doc(db, "userProfiles", uid);
      await setDoc(userProfileRef, removeUndefined(profile), { merge: true });
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  }

  // AI Challenge Methods
  async saveGeneratedChallenges(
    userId: string,
    challenges: AIChallenge[]
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const timestamp = Timestamp.now();

      challenges.forEach((challenge) => {
        const challengeRef = doc(
          collection(db, "users", userId, "generatedChallenges"),
          challenge.id
        );

        batch.set(challengeRef, {
          ...challenge,
          generatedAt: timestamp,
          isActive: true,
          createdAt: timestamp,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error saving generated challenges:", error);
      throw error;
    }
  }

  async getGeneratedChallenges(userId: string): Promise<AIChallenge[]> {
    try {
      const generatedRef = collection(
        db,
        "users",
        userId,
        "generatedChallenges"
      );
      const q = query(generatedRef, where("isActive", "==", true));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isAI: true,
        createdAt: safeToDate(doc.data().createdAt) || new Date(),
        generatedAt: safeToDate(doc.data().generatedAt) || new Date(),
      })) as AIChallenge[];
    } catch (error) {
      console.error("Error getting generated challenges:", error);
      return [];
    }
  }

  async joinAIChallenge(userId: string, challengeId: string): Promise<void> {
    try {
      // Get the AI challenge details
      const challengeRef = doc(
        db,
        "users",
        userId,
        "generatedChallenges",
        challengeId
      );
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error("AI Challenge not found");
      }

      const challengeData = challengeSnap.data();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + (challengeData.duration || 30));

      // Add to user challenges
      const userChallengeRef = collection(db, "userChallenges");
      await addDoc(
        userChallengeRef,
        removeUndefined({
          userId,
          challengeId,
          challenge: {
            ...challengeData,
            id: challengeId,
            isAI: true,
          },
          startDate,
          endDate,
          current: 0,
          progress: 0,
          completed: false,
        })
      );
    } catch (error) {
      console.error("Error joining AI challenge:", error);
      throw error;
    }
  }

  // User Stats
  async initializeUserStats(userId: string): Promise<void> {
    const userStatsRef = doc(db, "userStats", userId);
    const userStats: UserStats = {
      userId,
      totalWorkouts: 0,
      weeklyWorkouts: 0,
      totalHours: 0,
      currentLevel: 1,
      totalXP: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(userStatsRef, removeUndefined(userStats));
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const userStatsRef = doc(db, "userStats", userId);
      const docSnap = await getDoc(userStatsRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: safeToDate(data.createdAt) || new Date(),
          updatedAt: safeToDate(data.updatedAt) || new Date(),
          lastWorkoutDate: safeToDate(data.lastWorkoutDate),
        } as UserStats;
      }
      return null;
    } catch (error) {
      console.error("Error getting user stats:", error);
      return null;
    }
  }

  async updateUserStats(
    userId: string,
    updates: Partial<UserStats>
  ): Promise<void> {
    try {
      const userStatsRef = doc(db, "userStats", userId);
      const cleanUpdates = removeUndefined({
        ...updates,
        updatedAt: Timestamp.now(),
      });
      await updateDoc(userStatsRef, cleanUpdates);
    } catch (error) {
      console.error("Error updating user stats:", error);
      throw error;
    }
  }

  subscribeToUserStats(
    userId: string,
    callback: (stats: UserStats | null) => void
  ) {
    const userStatsRef = doc(db, "userStats", userId);

    return onSnapshot(userStatsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const stats: UserStats = {
          ...data,
          createdAt: safeToDate(data.createdAt) || new Date(),
          updatedAt: safeToDate(data.updatedAt) || new Date(),
          lastWorkoutDate: safeToDate(data.lastWorkoutDate),
        } as UserStats;
        callback(stats);
      } else {
        callback(null);
      }
    });
  }

  // Challenges
  async getAvailableChallenges(): Promise<Challenge[]> {
    try {
      const challengesRef = collection(db, "challenges");
      const q = query(challengesRef, where("isActive", "==", true));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: safeToDate(doc.data().createdAt) || new Date(),
      })) as Challenge[];
    } catch (error) {
      console.error("Error getting challenges:", error);
      return [];
    }
  }

  async joinChallenge(userId: string, challengeId: string): Promise<void> {
    try {
      // Get challenge details
      const challengeRef = doc(db, "challenges", challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error("Challenge not found");
      }

      const challenge = {
        id: challengeSnap.id,
        ...challengeSnap.data(),
        createdAt: safeToDate(challengeSnap.data()!.createdAt) || new Date(),
      } as Challenge;

      // Create user challenge
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + challenge.duration * 24 * 60 * 60 * 1000
      );

      const userChallenge: Omit<UserChallenge, "id"> = {
        userId,
        challengeId,
        challenge,
        startDate: startDate,
        endDate: endDate,
        current: 0,
        progress: 0,
        completed: false,
      };

      const userChallengesRef = collection(db, "userChallenges");
      await addDoc(userChallengesRef, removeUndefined(userChallenge));
    } catch (error) {
      console.error("Error joining challenge:", error);
      throw error;
    }
  }

  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    try {
      const userChallengesRef = collection(db, "userChallenges");
      const q = query(userChallengesRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const challenges = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: safeToDate(doc.data().startDate) || new Date(),
        endDate: safeToDate(doc.data().endDate) || new Date(),
        completedAt: safeToDate(doc.data().completedAt),
        challenge: {
          ...doc.data().challenge,
          createdAt: safeToDate(doc.data().challenge.createdAt) || new Date(),
        },
      })) as UserChallenge[];

      return challenges.sort(
        (a, b) => b.startDate.getTime() - a.startDate.getTime()
      );
    } catch (error) {
      console.error("Error getting user challenges:", error);
      return [];
    }
  }

  subscribeToUserChallenges(
    userId: string,
    callback: (challenges: UserChallenge[]) => void
  ) {
    const userChallengesRef = collection(db, "userChallenges");
    const q = query(userChallengesRef, where("userId", "==", userId));

    return onSnapshot(q, (querySnapshot) => {
      const challenges = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: safeToDate(doc.data().startDate) || new Date(),
        endDate: safeToDate(doc.data().endDate) || new Date(),
        completedAt: safeToDate(doc.data().completedAt),
        challenge: {
          ...doc.data().challenge,
          createdAt: safeToDate(doc.data().challenge.createdAt) || new Date(),
        },
      })) as UserChallenge[];

      const sortedChallenges = challenges.sort(
        (a, b) => b.startDate.getTime() - a.startDate.getTime()
      );
      callback(sortedChallenges);
    });
  }

  // User Workouts
  async addWorkoutToUser(
    userId: string,
    workout: Omit<UserWorkout, "id" | "userId" | "createdAt">
  ): Promise<string> {
    try {
      const userWorkoutsRef = collection(db, "userWorkouts");

      // Completely clean the workout data
      const cleanWorkout = {
        name: workout.name || "Untitled Workout",
        exercises: workout.exercises.map((exercise) => ({
          exercise: {
            id: exercise.exercise.id || "",
            name: exercise.exercise.name || "Unknown Exercise",
            bodyPart: exercise.exercise.bodyPart || "general",
            target: exercise.exercise.target || "general",
            equipment: exercise.exercise.equipment || "body weight",
            gifUrl: exercise.exercise.gifUrl || "",
            instructions: Array.isArray(exercise.exercise.instructions)
              ? exercise.exercise.instructions
              : [],
            secondaryMuscles: Array.isArray(exercise.exercise.secondaryMuscles)
              ? exercise.exercise.secondaryMuscles
              : [],
            difficulty: exercise.exercise.difficulty || "Intermediate",
            category: exercise.exercise.category || "general",
            description: exercise.exercise.description || "",
          },
          sets: exercise.sets || 3,
          reps: exercise.reps || 12,
          duration: exercise.duration || null,
          restTime: exercise.restTime || 60,
        })),
        isCustom: workout.isCustom || false,
        category: workout.category || "general",
      };

      const workoutData = {
        ...cleanWorkout,
        userId,
        createdAt: Timestamp.now(),
      };

      const cleanedData = removeUndefined(workoutData);
      const docRef = await addDoc(userWorkoutsRef, cleanedData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding workout:", error);
      throw error;
    }
  }

  async getUserWorkouts(userId: string): Promise<UserWorkout[]> {
    try {
      const userWorkoutsRef = collection(db, "userWorkouts");
      const q = query(userWorkoutsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const workouts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: safeToDate(data.createdAt) || new Date(),
          lastUsed: safeToDate(data.lastUsed),
        };
      }) as UserWorkout[];

      return workouts.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } catch (error) {
      console.error("Error getting user workouts:", error);
      return [];
    }
  }

  async deleteUserWorkout(workoutId: string): Promise<void> {
    try {
      const workoutRef = doc(db, "userWorkouts", workoutId);
      await deleteDoc(workoutRef);
    } catch (error) {
      console.error("Error deleting workout:", error);
      throw error;
    }
  }

  // Workout Sessions
  async startWorkoutSession(
    userId: string,
    workoutId: string,
    workoutData: UserWorkout
  ): Promise<string> {
    try {
      const sessionData = {
        userId,
        workoutId,
        workout: removeUndefined(workoutData),
        startTime: Timestamp.now(),
        completed: false,
      };

      // Make sure this path matches your Firestore structure
      const sessionRef = await addDoc(
        collection(db, "workoutSessions"), // or `users/${userId}/workoutSessions`
        sessionData
      );
      return sessionRef.id;
    } catch (error) {
      console.error("Error starting workout session:", error);
      throw error;
    }
  }

  async getWorkoutSession(
    sessionId: string,
    userId: string
  ): Promise<WorkoutSession | null> {
    try {
      // Adjust this path to match where you store sessions
      const sessionRef = doc(db, "workoutSessions", sessionId);
      // or doc(db, "users", userId, "workoutSessions", sessionId)

      const docSnap = await getDoc(sessionRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          startTime: safeToDate(data.startTime) || new Date(),
          endTime: safeToDate(data.endTime),
        } as WorkoutSession;
      }
      return null;
    } catch (error) {
      console.error("Error getting workout session:", error);
      return null;
    }
  }

  async completeWorkoutSession(
sessionId: string, duration: number, uid: string  ): Promise<void> {
    try {
      const sessionRef = doc(db, "workoutSessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        throw new Error("Workout session not found");
      }

      const sessionData = sessionSnap.data() as WorkoutSession;

      // Update session
      const sessionUpdates = removeUndefined({
        endTime: Timestamp.now(),
        completed: true,
        duration,
      });
      await updateDoc(sessionRef, sessionUpdates);

      // Update user stats
      const userStatsRef = doc(db, "userStats", sessionData.userId);
      const statsUpdates = removeUndefined({
        totalWorkouts: increment(1),
        weeklyWorkouts: increment(1),
        totalHours: increment(duration / 60),
        lastWorkoutDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await updateDoc(userStatsRef, statsUpdates);

      // Update challenge progress
      await this.updateChallengeProgress(sessionData.userId);
    } catch (error) {
      console.error("Error completing workout session:", error);
      throw error;
    }
  }

  private async updateChallengeProgress(userId: string): Promise<void> {
    try {
      const userChallengesRef = collection(db, "userChallenges");
      const q = query(
        userChallengesRef,
        where("userId", "==", userId),
        where("completed", "==", false)
      );
      const querySnapshot = await getDocs(q);

      for (const challengeDoc of querySnapshot.docs) {
        const userChallenge = challengeDoc.data() as UserChallenge;
        const newCurrent = userChallenge.current + 1;
        const newProgress = (newCurrent / userChallenge.challenge.target) * 100;
        const completed = newCurrent >= userChallenge.challenge.target;

        const updates: any = {
          current: newCurrent,
          progress: Math.min(newProgress, 100),
        };

        if (completed) {
          updates.completed = true;
          updates.completedAt = Timestamp.now();

          // Award XP
          const userStatsRef = doc(db, "userStats", userId);
          const xpUpdates = removeUndefined({
            totalXP: increment(userChallenge.challenge.xpReward),
            updatedAt: Timestamp.now(),
          });
          await updateDoc(userStatsRef, xpUpdates);

          // Add to completed challenges in profile
          const userProfileRef = doc(db, "userProfiles", userId);
          await updateDoc(userProfileRef, {
            completedChallenges: fbArrayUnion(userChallenge.challengeId),
          });
        }

        const cleanedUpdates = removeUndefined(updates);
        await updateDoc(challengeDoc.ref, cleanedUpdates);
      }
    } catch (error) {
      console.error("Error updating challenge progress:", error);
    }
  }

  // Workout Sessions Subscription
  subscribeToWorkoutSessions(
    userId: string,
    callback: (sessions: WorkoutSession[]) => void
  ) {
    const workoutSessionsRef = collection(db, "workoutSessions");
    const q = query(
      workoutSessionsRef,
      where("userId", "==", userId),
      where("completed", "==", false)
    );

    return onSnapshot(q, (querySnapshot) => {
      const sessions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startTime: safeToDate(doc.data().startTime) || new Date(),
        endTime: safeToDate(doc.data().endTime),
      })) as WorkoutSession[];

      callback(sessions);
    });
  }

  async getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    try {
      // Update this path to match your actual Firestore structure
      const workoutSessionsRef = collection(
        db,
        "users",
        userId,
        "workoutSessions"
      );
      const querySnapshot = await getDocs(workoutSessionsRef);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startTime: safeToDate(doc.data().startTime) || new Date(),
        endTime: safeToDate(doc.data().endTime),
      })) as WorkoutSession[];
    } catch (error) {
      console.error("Error getting workout sessions:", error);
      return [];
    }
  }
}

export const firestoreService = new FirestoreService();
