import { exerciseApi, type Exercise } from "./exerciseApi";

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  duration?: number;
  restTime: number;
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  exercises: WorkoutExercise[];
  category: string;
}

export interface WorkoutPreferences {
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  bodyParts: string[];
  equipment: string[];
  fitnessGoal: "weight_loss" | "muscle_gain" | "endurance" | "strength";
}

class WorkoutGenerator {
  async generateWorkout(
    preferences: WorkoutPreferences
  ): Promise<GeneratedWorkout> {
    try {
      const exercises: Exercise[] = [];

      // Get exercises for each body part
      for (const bodyPart of preferences.bodyParts) {
        const bodyPartExercises = await exerciseApi.getExercisesByBodyPart(
          bodyPart,
          5
        );
        exercises.push(...bodyPartExercises.slice(0, 2));
      }

      // Filter by difficulty and equipment
      const filteredExercises = exercises.filter((exercise) => {
        const matchesDifficulty =
          exercise.difficulty === preferences.difficulty;
        const matchesEquipment = preferences.equipment.some((eq) =>
          exercise.equipment.toLowerCase().includes(eq.toLowerCase())
        );
        return matchesDifficulty || matchesEquipment;
      });

      // Create workout exercises with sets/reps based on goal
      const workoutExercises: WorkoutExercise[] = filteredExercises.map(
        (exercise) => {
          const { sets, reps, duration, restTime } = this.getExerciseParameters(
            exercise,
            preferences.fitnessGoal,
            preferences.difficulty
          );

          return {
            exercise,
            sets,
            reps,
            duration,
            restTime,
          };
        }
      );

      const workout: GeneratedWorkout = {
        id: `workout_${Date.now()}`,
        name: this.generateWorkoutName(preferences),
        description: this.generateWorkoutDescription(preferences),
        duration: preferences.duration,
        difficulty: preferences.difficulty,
        exercises: workoutExercises,
        category: preferences.bodyParts.join(", "),
      };

      return workout;
    } catch (error) {
      console.error("Error generating workout:", error);
      return this.getFallbackWorkout(preferences);
    }
  }

  async getQuickWorkouts(): Promise<GeneratedWorkout[]> {
    const quickWorkouts: GeneratedWorkout[] = [
      {
        id: "quick_1",
        name: "Morning Energy Boost",
        description: "A quick 15-minute workout to energize your morning",
        duration: 15,
        difficulty: "Beginner",
        category: "Full Body",
        exercises: [
          {
            exercise: {
              id: "jumping_jacks",
              name: "Jumping Jacks",
              bodyPart: "cardio",
              target: "cardiovascular system",
              equipment: "body weight",
              gifUrl:
                "/placeholder.svg?height=300&width=300&text=Jumping+Jacks",
              difficulty: "Beginner",
              category: "cardio",
            },
            sets: 3,
            reps: 20,
            restTime: 30,
          },
          {
            exercise: {
              id: "push_ups",
              name: "Push-ups",
              bodyPart: "chest",
              target: "pectorals",
              equipment: "body weight",
              gifUrl: "/placeholder.svg?height=300&width=300&text=Push-ups",
              difficulty: "Beginner",
              category: "chest",
            },
            sets: 3,
            reps: 10,
            restTime: 45,
          },
          {
            exercise: {
              id: "squats",
              name: "Squats",
              bodyPart: "upper legs",
              target: "quadriceps",
              equipment: "body weight",
              gifUrl: "/placeholder.svg?height=300&width=300&text=Squats",
              difficulty: "Beginner",
              category: "upper legs",
            },
            sets: 3,
            reps: 15,
            restTime: 45,
          },
        ],
      },
      {
        id: "quick_2",
        name: "HIIT Blast",
        description: "High-intensity interval training for maximum results",
        duration: 12,
        difficulty: "Intermediate",
        category: "HIIT",
        exercises: [
          {
            exercise: {
              id: "burpees",
              name: "Burpees",
              bodyPart: "cardio",
              target: "cardiovascular system",
              equipment: "body weight",
              gifUrl: "/placeholder.svg?height=300&width=300&text=Burpees",
              difficulty: "Intermediate",
              category: "cardio",
            },
            sets: 4,
            reps: 8,
            restTime: 30,
          },
          {
            exercise: {
              id: "mountain_climbers",
              name: "Mountain Climbers",
              bodyPart: "cardio",
              target: "cardiovascular system",
              equipment: "body weight",
              gifUrl:
                "/placeholder.svg?height=300&width=300&text=Mountain+Climbers",
              difficulty: "Intermediate",
              category: "cardio",
            },
            sets: 4,
            reps: 20,
            restTime: 30,
          },
        ],
      },
      {
        id: "quick_3",
        name: "Core Strength",
        description: "Build a strong core with targeted exercises",
        duration: 20,
        difficulty: "All Levels",
        category: "Core",
        exercises: [
          {
            exercise: {
              id: "plank",
              name: "Plank",
              bodyPart: "waist",
              target: "abs",
              equipment: "body weight",
              gifUrl: "/placeholder.svg?height=300&width=300&text=Plank",
              difficulty: "Beginner",
              category: "waist",
            },
            sets: 3,
            reps: 0,
            duration: 30,
            restTime: 60,
          },
          {
            exercise: {
              id: "crunches",
              name: "Crunches",
              bodyPart: "waist",
              target: "abs",
              equipment: "body weight",
              gifUrl: "/placeholder.svg?height=300&width=300&text=Crunches",
              difficulty: "Beginner",
              category: "waist",
            },
            sets: 3,
            reps: 20,
            restTime: 45,
          },
        ],
      },
    ];

    return quickWorkouts;
  }

  private getExerciseParameters(
    exercise: Exercise,
    goal: string,
    difficulty: string
  ): { sets: number; reps: number; duration?: number; restTime: number } {
    const isCardio = exercise.bodyPart === "cardio";

    if (isCardio) {
      return {
        sets: 3,
        reps: 0,
        duration: goal === "endurance" ? 45 : 30,
        restTime: 60,
      };
    }

    const baseParams = {
      weight_loss: { sets: 3, reps: 15, restTime: 45 },
      muscle_gain: { sets: 4, reps: 8, restTime: 90 },
      endurance: { sets: 3, reps: 20, restTime: 30 },
      strength: { sets: 5, reps: 5, restTime: 120 },
    };

    const difficultyMultiplier = {
      Beginner: 0.8,
      Intermediate: 1.0,
      Advanced: 1.2,
    };

    const params =
      baseParams[goal as keyof typeof baseParams] || baseParams.weight_loss;
    const multiplier =
      difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] ||
      1.0;

    return {
      sets: Math.round(params.sets * multiplier),
      reps: Math.round(params.reps * multiplier),
      restTime: params.restTime,
    };
  }

  private generateWorkoutName(preferences: WorkoutPreferences): string {
    const goalNames = {
      weight_loss: "Fat Burn",
      muscle_gain: "Muscle Builder",
      endurance: "Endurance",
      strength: "Strength",
    };

    const bodyPartName =
      preferences.bodyParts.length === 1
        ? preferences.bodyParts[0].charAt(0).toUpperCase() +
          preferences.bodyParts[0].slice(1)
        : "Full Body";

    return `${preferences.difficulty} ${
      goalNames[preferences.fitnessGoal]
    } - ${bodyPartName}`;
  }

  private generateWorkoutDescription(preferences: WorkoutPreferences): string {
    const duration = preferences.duration;
    const bodyParts = preferences.bodyParts.join(" and ");
    const goal = preferences.fitnessGoal.replace("_", " ");

    return `A ${duration}-minute ${preferences.difficulty.toLowerCase()} workout targeting ${bodyParts} for ${goal}.`;
  }

  private getFallbackWorkout(
    preferences: WorkoutPreferences
  ): GeneratedWorkout {
    return {
      id: "fallback_workout",
      name: "Basic Workout",
      description: "A simple bodyweight workout",
      duration: preferences.duration,
      difficulty: preferences.difficulty,
      category: "Full Body",
      exercises: [
        {
          exercise: {
            id: "push_ups_fallback",
            name: "Push-ups",
            bodyPart: "chest",
            target: "pectorals",
            equipment: "body weight",
            gifUrl: "/placeholder.svg?height=300&width=300&text=Push-ups",
            difficulty: "Beginner",
            category: "chest",
          },
          sets: 3,
          reps: 10,
          restTime: 60,
        },
      ],
    };
  }
}

export const workoutGenerator = new WorkoutGenerator();
