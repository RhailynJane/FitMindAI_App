import { exerciseApi, type Exercise } from "./exerciseApi";

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  duration?: number; // in seconds for cardio
  restTime: number; // in seconds
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  targetBodyParts: string[];
  exercises: WorkoutExercise[];
}

export interface WorkoutPreferences {
  duration: number; // in minutes
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  bodyParts: string[];
  equipment: string[];
  fitnessGoal: "weight_loss" | "muscle_gain" | "endurance" | "strength";
}

class WorkoutGeneratorService {
  async generateWorkout(
    preferences: WorkoutPreferences
  ): Promise<GeneratedWorkout> {
    const exercises = await this.getExercisesForWorkout(preferences);

    if (exercises.length === 0) {
      throw new Error(
        "No exercises found for the specified preferences. Please try different body parts or equipment."
      );
    }

    const workoutExercises = this.createWorkoutStructure(
      exercises,
      preferences
    );

    return {
      id: Date.now().toString(),
      name: this.generateWorkoutName(preferences),
      description: this.generateWorkoutDescription(preferences),
      duration: preferences.duration,
      difficulty: preferences.difficulty.toLowerCase() as
        | "beginner"
        | "intermediate"
        | "advanced",
      targetBodyParts: preferences.bodyParts,
      exercises: workoutExercises,
    };
  }

  async getQuickWorkouts(): Promise<GeneratedWorkout[]> {
    const quickWorkoutConfigs = [
      {
        duration: 15,
        difficulty: "Beginner" as const,
        bodyParts: ["chest", "upper legs"],
        equipment: ["body weight"],
        fitnessGoal: "weight_loss" as const,
      },
      {
        duration: 20,
        difficulty: "Intermediate" as const,
        bodyParts: ["cardio", "waist"],
        equipment: ["body weight"],
        fitnessGoal: "endurance" as const,
      },
      {
        duration: 25,
        difficulty: "Advanced" as const,
        bodyParts: ["upper arms", "chest", "back"],
        equipment: ["body weight"],
        fitnessGoal: "strength" as const,
      },
    ];

    const workouts: GeneratedWorkout[] = [];

    for (const config of quickWorkoutConfigs) {
      try {
        const workout = await this.generateWorkout(config);
        workouts.push(workout);
      } catch (error) {
        console.error(`Failed to generate workout for config:`, config, error);
        // Skip this workout if it fails, don't add fallback
      }
    }

    if (workouts.length === 0) {
      throw new Error(
        "Unable to generate any workouts. Please check your API connection and try again."
      );
    }

    return workouts;
  }

  private async getExercisesForWorkout(
    preferences: WorkoutPreferences
  ): Promise<Exercise[]> {
    const allExercises: Exercise[] = [];

    // Get exercises for each target body part
    for (const bodyPart of preferences.bodyParts) {
      try {
        const exercises = await exerciseApi.getExercisesByBodyPart(bodyPart, 5);
        allExercises.push(...exercises);
      } catch (error) {
        console.error(
          `Failed to get exercises for body part: ${bodyPart}`,
          error
        );
        // Continue with other body parts
      }
    }

    if (allExercises.length === 0) {
      throw new Error(
        `No exercises found for body parts: ${preferences.bodyParts.join(", ")}`
      );
    }

    // Filter by equipment if specified
    const filteredExercises =
      preferences.equipment.length > 0
        ? allExercises.filter((exercise) =>
            preferences.equipment.some((equipment) =>
              exercise.equipment.toLowerCase().includes(equipment.toLowerCase())
            )
          )
        : allExercises;

    // Remove duplicates
    const uniqueExercises = filteredExercises.filter(
      (exercise, index, self) =>
        index === self.findIndex((e) => e.id === exercise.id)
    );

    return uniqueExercises.slice(
      0,
      this.getExerciseCount(preferences.duration)
    );
  }

  private createWorkoutStructure(
    exercises: Exercise[],
    preferences: WorkoutPreferences
  ): WorkoutExercise[] {
    return exercises.map((exercise) => {
      const isCardio = exercise.bodyPart === "cardio";

      return {
        exercise,
        sets: isCardio ? 1 : this.getSetsForDifficulty(preferences.difficulty),
        reps: isCardio ? 0 : this.getRepsForDifficulty(preferences.difficulty),
        duration: isCardio
          ? this.getCardioDuration(preferences.difficulty)
          : undefined,
        restTime: this.getRestTime(preferences.difficulty),
      };
    });
  }

  private getExerciseCount(duration: number): number {
    if (duration <= 15) return 4;
    if (duration <= 25) return 6;
    if (duration <= 35) return 8;
    return 10;
  }

  private getSetsForDifficulty(difficulty: string): number {
    const normalizedDifficulty = difficulty.toLowerCase();
    switch (normalizedDifficulty) {
      case "beginner":
        return 2;
      case "intermediate":
        return 3;
      case "advanced":
        return 4;
      default:
        return 3;
    }
  }

  private getRepsForDifficulty(difficulty: string): number {
    const normalizedDifficulty = difficulty.toLowerCase();
    switch (normalizedDifficulty) {
      case "beginner":
        return 10;
      case "intermediate":
        return 15;
      case "advanced":
        return 20;
      default:
        return 12;
    }
  }

  private getCardioDuration(difficulty: string): number {
    const normalizedDifficulty = difficulty.toLowerCase();
    switch (normalizedDifficulty) {
      case "beginner":
        return 30;
      case "intermediate":
        return 45;
      case "advanced":
        return 60;
      default:
        return 45;
    }
  }

  private getRestTime(difficulty: string): number {
    const normalizedDifficulty = difficulty.toLowerCase();
    switch (normalizedDifficulty) {
      case "beginner":
        return 60;
      case "intermediate":
        return 45;
      case "advanced":
        return 30;
      default:
        return 45;
    }
  }

  private generateWorkoutName(preferences: WorkoutPreferences): string {
    const bodyPartNames = preferences.bodyParts.join(" & ");
    const duration = preferences.duration;

    return `${duration}-Min ${bodyPartNames} Workout`;
  }

  private generateWorkoutDescription(preferences: WorkoutPreferences): string {
    const goal = preferences.fitnessGoal.replace("_", " ");
    return `A ${preferences.difficulty.toLowerCase()} ${
      preferences.duration
    }-minute workout focused on ${goal} and targeting ${preferences.bodyParts.join(
      ", "
    )}.`;
  }
}

export const workoutGenerator = new WorkoutGeneratorService();
