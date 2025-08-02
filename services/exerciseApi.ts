const EXERCISEDB_API_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY ?? "";
const BASE_URL = "https://exercisedb.p.rapidapi.com";

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  instructions?: string[];
  secondaryMuscles?: string[];
  difficulty: string;
  category: string;
  description?: string;
}

export class ApiOfflineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiOfflineError";
  }
}

class ExerciseApi {
  private async fetchWithAuth(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          "X-RapidAPI-Key": EXERCISEDB_API_KEY,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new ApiOfflineError(
            "Exercise database is currently offline. We're working to restore the service."
          );
        }
        if (response.status === 429) {
          throw new ApiOfflineError(
            "Exercise database is currently experiencing high traffic. We're working to restore normal service."
          );
        }
        throw new ApiOfflineError(
          "Exercise database is currently offline. We're working to restore the service."
        );
      }

      return response.json();
    } catch (error) {
      console.error("API fetch error:", error);
      if (error instanceof ApiOfflineError) {
        throw error;
      }
      throw new ApiOfflineError(
        "Exercise database is currently offline. We're working to restore the service."
      );
    }
  }

  async getBodyParts(): Promise<string[]> {
    try {
      const data = await this.fetchWithAuth(
        `${BASE_URL}/exercises/bodyPartList`
      );
      return data || [];
    } catch (error) {
      console.error("Error fetching body parts:", error);
      throw error;
    }
  }

  async getExercisesByBodyPart(
    bodyPart: string,
    limit = 20
  ): Promise<Exercise[]> {
    try {
      const data = await this.fetchWithAuth(
        `${BASE_URL}/exercises/bodyPart/${bodyPart}?limit=${limit}`
      );

      return data.map((exercise: any) => ({
        id: exercise.id,
        name: exercise.name,
        bodyPart: exercise.bodyPart,
        target: exercise.target,
        equipment: exercise.equipment,
        gifUrl: exercise.gifUrl,
        instructions: exercise.instructions || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        difficulty: this.getDifficulty(exercise.equipment),
        category: exercise.bodyPart,
        description: `A ${exercise.bodyPart} exercise targeting ${exercise.target} using ${exercise.equipment}.`,
      })) as Exercise[];
    } catch (error) {
      console.error("Error fetching exercises by body part:", error);
      throw error;
    }
  }

  async getExerciseById(id: string): Promise<Exercise> {
    try {
      const data = await this.fetchWithAuth(
        `${BASE_URL}/exercises/exercise/${id}`
      );

      return {
        id: data.id,
        name: data.name,
        bodyPart: data.bodyPart,
        target: data.target,
        equipment: data.equipment,
        gifUrl: data.gifUrl,
        instructions: data.instructions || [],
        secondaryMuscles: data.secondaryMuscles || [],
        difficulty: this.getDifficulty(data.equipment),
        category: data.bodyPart,
        description: `A ${data.bodyPart} exercise targeting ${data.target} using ${data.equipment}.`,
      };
    } catch (error) {
      console.error("Error fetching exercise by ID:", error);
      throw error;
    }
  }

  private getDifficulty(equipment: string): string {
    const bodyWeightEquipment = ["body weight", "assisted"];
    const beginnerEquipment = ["dumbbell", "kettlebell", "resistance band"];
    const intermediateEquipment = ["barbell", "cable", "smith machine"];
    const advancedEquipment = ["olympic barbell", "trap bar"];

    if (bodyWeightEquipment.includes(equipment.toLowerCase()))
      return "Beginner";
    if (beginnerEquipment.some((eq) => equipment.toLowerCase().includes(eq)))
      return "Beginner";
    if (
      intermediateEquipment.some((eq) => equipment.toLowerCase().includes(eq))
    )
      return "Intermediate";
    if (advancedEquipment.some((eq) => equipment.toLowerCase().includes(eq)))
      return "Advanced";

    return "Intermediate";
  }
}

export const exerciseApi = new ExerciseApi();
