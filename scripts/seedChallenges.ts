import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebase";

interface Challenge {
  title: string;
  description: string;
  type: "consistency" | "strength" | "cardio" | "custom";
  duration: number; // in days
  target: number; // target value (workouts, hours, etc.)
  reward: string;
  isActive: boolean;
}

const challenges: Omit<Challenge, "isActive">[] = [
  // 7-Day Challenges
  {
    title: "7-Day Consistency Challenge",
    description: "Complete a workout every day for 7 days straight",
    type: "consistency",
    duration: 7,
    target: 7,
    reward: "Consistency Badge + 50 XP",
  },
  {
    title: "Week of Strength",
    description: "Focus on strength training for 7 days",
    type: "strength",
    duration: 7,
    target: 5,
    reward: "Strength Badge + 75 XP",
  },
  {
    title: "Cardio Week",
    description: "Complete 5 cardio sessions in 7 days",
    type: "cardio",
    duration: 7,
    target: 5,
    reward: "Cardio Badge + 60 XP",
  },

  // 14-Day Challenges
  {
    title: "14-Day Transformation",
    description: "Complete 10 workouts in 14 days",
    type: "consistency",
    duration: 14,
    target: 10,
    reward: "Transformation Badge + 100 XP",
  },
  {
    title: "Two-Week Strength Builder",
    description: "Complete 8 strength workouts in 14 days",
    type: "strength",
    duration: 14,
    target: 8,
    reward: "Strength Builder Badge + 120 XP",
  },

  // 30-Day Challenges
  {
    title: "30-Day Fitness Journey",
    description: "Complete 20 workouts in 30 days",
    type: "consistency",
    duration: 30,
    target: 20,
    reward: "Journey Badge + 200 XP",
  },
  {
    title: "Monthly Strength Challenge",
    description: "Complete 15 strength training sessions in 30 days",
    type: "strength",
    duration: 30,
    target: 15,
    reward: "Monthly Strength Badge + 250 XP",
  },
  {
    title: "Cardio Master Challenge",
    description: "Complete 18 cardio sessions in 30 days",
    type: "cardio",
    duration: 30,
    target: 18,
    reward: "Cardio Master Badge + 220 XP",
  },

  // 60-Day Challenges
  {
    title: "60-Day Lifestyle Change",
    description: "Complete 35 workouts in 60 days",
    type: "consistency",
    duration: 60,
    target: 35,
    reward: "Lifestyle Badge + 400 XP",
  },
  {
    title: "Ultimate Strength Challenge",
    description: "Complete 25 strength sessions in 60 days",
    type: "strength",
    duration: 60,
    target: 25,
    reward: "Ultimate Strength Badge + 500 XP",
  },

  // 90-Day Challenges
  {
    title: "90-Day Transformation",
    description: "Complete 50 workouts in 90 days",
    type: "consistency",
    duration: 90,
    target: 50,
    reward: "Transformation Master Badge + 750 XP",
  },
  {
    title: "Quarter Year Fitness",
    description: "Complete 60 workouts in 90 days",
    type: "consistency",
    duration: 90,
    target: 60,
    reward: "Quarter Master Badge + 1000 XP",
  },
];

export async function seedChallenges() {
  try {
    console.log("Starting to seed challenges...");

    for (const challenge of challenges) {
      const challengeData = {
        ...challenge,
        isActive: true,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(firestore, "challenges"),
        challengeData
      );
      console.log(`Added challenge: ${challenge.title} with ID: ${docRef.id}`);
    }

    console.log("Successfully seeded all challenges!");
  } catch (error) {
    console.error("Error seeding challenges:", error);
    throw error;
  }
}

// Run this function to seed the database
seedChallenges();
