// Load API key from environment variables, fallback to empty string if undefined
const EXERCISEDB_API_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY ?? "";

// Base URL for the ExerciseDB API
const BASE_URL = "https://exercisedb.p.rapidapi.com";

// TypeScript interface representing an exercise object
export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  instructions?: string[]; // Optional array of steps
  secondaryMuscles?: string[]; // Optional array of supporting muscles
  difficulty: string; // Custom-calculated field
  category: string; // Based on bodyPart
  description?: string; // Auto-generated summary
}

// Custom error class for when the API is offline
export class ApiOfflineError extends Error {
  constructor(message: string) {
    super(message); // Call the parent Error class constructor
    this.name = "ApiOfflineError"; // Set error name
  }
}

// Main class handling communication with ExerciseDB API
class ExerciseApi {
  // Internal helper to fetch data with required API headers
  private async fetchWithAuth(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          "X-RapidAPI-Key": EXERCISEDB_API_KEY,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      });

      // Handle common error responses
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

      return response.json(); // Parse and return JSON
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

  // Fetch a list of exercises with optional limit
  async getExercises(limit = 20): Promise<Exercise[]> {
    try {
      const data = await this.fetchWithAuth(
        `${BASE_URL}/exercises?limit=${limit}`
      );

      // Transform raw API response into Exercise[] with additional fields
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
      console.error("Error fetching exercises:", error);
      throw error;
    }
  }

  // Fetch a list of all available body parts
  async getBodyParts(): Promise<string[]> {
    try {
      const data = await this.fetchWithAuth(
        `${BASE_URL}/exercises/bodyPartList`
      );
      return data || []; // Fallback to empty array if undefined
    } catch (error) {
      console.error("Error fetching body parts:", error);
      throw error;
    }
  }

  // Fetch exercises filtered by a specific body part
  async getExercisesByBodyPart(
    bodyPart: string,
    limit = 20
  ): Promise<Exercise[]> {
    try {
      const data = await this.fetchWithAuth(
        `${BASE_URL}/exercises/bodyPart/${bodyPart}?limit=${limit}`
      );

      // Map and normalize data structure
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

  // Fetch a single exercise by ID
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

  async getExerciseGifUrl(
    exerciseId: string,
    resolution = "360"
  ): Promise<string> {
    return `${BASE_URL}/image?exerciseId=${exerciseId}&resolution=${resolution}&rapidapi-key=${EXERCISEDB_API_KEY}`;
  }

  // Utility to determine difficulty level based on equipment
  private getDifficulty(equipment: string): string {
    const bodyWeightEquipment = ["body weight", "assisted"];
    const beginnerEquipment = ["dumbbell", "kettlebell", "resistance band"];
    const intermediateEquipment = ["barbell", "cable", "smith machine"];
    const advancedEquipment = ["olympic barbell", "trap bar"];

    // Match equipment to difficulty category
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

    // Default to Intermediate
    return "Intermediate";
  }
}

// Export a single instance for reuse across the app
export const exerciseApi = new ExerciseApi();
