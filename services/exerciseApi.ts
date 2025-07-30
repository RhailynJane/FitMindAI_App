// Using ExerciseDB API through RapidAPI Gateway
const EXERCISE_API_KEY = process.env.EXPO_PUBLIC_EXERCISE_API_KEY || "";
const EXERCISE_API_HOST = "exercisedb.p.rapidapi.com";

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category:
    | "strength"
    | "cardio"
    | "mobility"
    | "balance"
    | "stretching"
    | "plyometrics"
    | "rehabilitation";
  gifUrl?: string;
}

class ExerciseApiService {
  private baseUrl = "https://exercisedb.p.rapidapi.com";
  private cache = new Map<string, any>();
  private lastApiCall = 0;
  private minApiInterval = 100;

  private async fetchWithHeaders(url: string) {
    // Rate limiting
    const now = Date.now();
    if (now - this.lastApiCall < this.minApiInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minApiInterval - (now - this.lastApiCall))
      );
    }
    this.lastApiCall = Date.now();

    // Check cache first
    const cacheKey = url;
    if (this.cache.has(cacheKey)) {
      console.log("Using cached data for:", url);
      return this.cache.get(cacheKey);
    }

    if (!EXERCISE_API_KEY) {
      throw new Error(
        "ExerciseDB API key is not configured. Please add EXPO_PUBLIC_EXERCISE_API_KEY to your environment variables."
      );
    }

    try {
      console.log("Fetching from ExerciseDB API:", url);
      const response = await fetch(url, {
        headers: {
          "X-RapidAPI-Key": EXERCISE_API_KEY,
          "X-RapidAPI-Host": EXERCISE_API_HOST,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Invalid API key or not subscribed to ExerciseDB API. Please check your RapidAPI subscription."
          );
        } else if (response.status === 403) {
          throw new Error(
            "Access forbidden. Please verify your API key and subscription status."
          );
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();

      // Cache the successful response for 5 minutes
      this.cache.set(cacheKey, data);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

      console.log("Successfully fetched and cached data");
      return data;
    } catch (error) {
      console.error("ExerciseDB API Error:", error);
      throw error;
    }
  }

  // Check API status
  async checkApiStatus(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        headers: {
          "X-RapidAPI-Key": EXERCISE_API_KEY,
          "X-RapidAPI-Host": EXERCISE_API_HOST,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error("API Status check failed:", error);
      throw error;
    }
  }

  // Get all exercises with optional limit and offset
  async getAllExercises(limit = 20, offset = 0): Promise<Exercise[]> {
    const url = `${this.baseUrl}/exercises?limit=${limit}&offset=${offset}`;
    const data = await this.fetchWithHeaders(url);
    return data.map((exercise: any) => this.transformExercise(exercise));
  }

  // Get exercises by body part
  async getExercisesByBodyPart(
    bodyPart: string,
    limit = 10
  ): Promise<Exercise[]> {
    const url = `${this.baseUrl}/exercises/bodyPart/${encodeURIComponent(
      bodyPart
    )}`;
    const data = await this.fetchWithHeaders(url);
    return data
      .slice(0, limit)
      .map((exercise: any) => this.transformExercise(exercise));
  }

  // Get exercises by target muscle
  async getExercisesByTarget(target: string, limit = 10): Promise<Exercise[]> {
    const url = `${this.baseUrl}/exercises/target/${encodeURIComponent(
      target
    )}`;
    const data = await this.fetchWithHeaders(url);
    return data
      .slice(0, limit)
      .map((exercise: any) => this.transformExercise(exercise));
  }

  // Get exercises by equipment
  async getExercisesByEquipment(
    equipment: string,
    limit = 10
  ): Promise<Exercise[]> {
    const url = `${this.baseUrl}/exercises/equipment/${encodeURIComponent(
      equipment
    )}`;
    const data = await this.fetchWithHeaders(url);
    return data
      .slice(0, limit)
      .map((exercise: any) => this.transformExercise(exercise));
  }

  // Get specific exercise by ID
  async getExerciseById(id: string): Promise<Exercise | null> {
    try {
      const url = `${this.baseUrl}/exercises/exercise/${id}`;
      const data = await this.fetchWithHeaders(url);
      return this.transformExercise(data);
    } catch (error) {
      console.error(`Exercise with ID ${id} not found:`, error);
      return null;
    }
  }

  // Get exercises by name (search)
  async getExercisesByName(name: string, limit = 10): Promise<Exercise[]> {
    const url = `${this.baseUrl}/exercises/name/${encodeURIComponent(name)}`;
    const data = await this.fetchWithHeaders(url);
    return data
      .slice(0, limit)
      .map((exercise: any) => this.transformExercise(exercise));
  }

  // Get list of body parts
  async getBodyParts(): Promise<string[]> {
    const url = `${this.baseUrl}/exercises/bodyPartList`;
    return await this.fetchWithHeaders(url);
  }

  // Get list of target muscles
  async getTargetMuscles(): Promise<string[]> {
    const url = `${this.baseUrl}/exercises/targetList`;
    return await this.fetchWithHeaders(url);
  }

  // Get list of equipment
  async getEquipmentList(): Promise<string[]> {
    const url = `${this.baseUrl}/exercises/equipmentList`;
    return await this.fetchWithHeaders(url);
  }

  private transformExercise(apiExercise: any): Exercise {
    return {
      id: apiExercise.id,
      name: apiExercise.name,
      bodyPart: apiExercise.bodyPart,
      target: apiExercise.target,
      equipment: apiExercise.equipment,
      secondaryMuscles: apiExercise.secondaryMuscles || [],
      instructions: apiExercise.instructions || [],
      description: apiExercise.description || "",
      difficulty: apiExercise.difficulty || "beginner",
      category: apiExercise.category || "strength",
      gifUrl:
        apiExercise.gifUrl || this.generatePlaceholderUrl(apiExercise.name),
    };
  }

  private generatePlaceholderUrl(exerciseName: string): string {
    const cleanName = exerciseName.replace(/\s+/g, "%20");
    return `/placeholder.svg?height=300&width=300&text=${cleanName}`;
  }
}

export const exerciseApi = new ExerciseApiService();
