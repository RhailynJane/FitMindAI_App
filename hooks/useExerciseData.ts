// React hook for managing state
import { useState } from "react";

// Import exercise API interface and type
import { exerciseApi, type Exercise } from "../services/exerciseApi";

// Import workout generator utility and type
import {
  workoutGenerator,
  type GeneratedWorkout,
} from "../services/workoutGenerator";

// Custom hook to manage exercise and workout data
export const useExerciseData = () => {
  // Store the list of exercises
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Store the list of available body parts (for filtering)
  const [bodyParts, setBodyParts] = useState<string[]>([]);

  // Store pre-generated quick workouts
  const [quickWorkouts, setQuickWorkouts] = useState<GeneratedWorkout[]>([]);

  // Track loading state for async operations
  const [loading, setLoading] = useState(false);

  // Track error messages, if any
  const [error, setError] = useState<string | null>(null);

  // Load a list of exercises from the API (default 20)
  const loadExercises = async (limit = 20) => {
    try {
      setLoading(true); // Begin loading
      setError(null); // Reset previous error
      const data = await exerciseApi.getExercises(limit); // Fetch exercises
      setExercises(data); // Store the fetched exercises
    } catch (err) {
      setError("Failed to load exercises"); // Set error state
      console.error("Error loading exercises:", err); // Log detailed error
    } finally {
      setLoading(false); // End loading
    }
  };

  // Load a list of available body parts from the API
  const loadBodyParts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exerciseApi.getBodyParts(); // Fetch body part list
      setBodyParts(data); // Store in state
    } catch (err) {
      setError("Failed to load body parts");
      console.error("Error loading body parts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load quick (pre-generated) workouts
  const loadQuickWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workoutGenerator.getQuickWorkouts(); // Fetch workouts
      setQuickWorkouts(data); // Save them
    } catch (err) {
      setError("Failed to load workouts");
      console.error("Error loading workouts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search for exercises that match a given query
  const searchExercises = async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      // Basic client-side search in current exercise list
      const filtered = exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query.toLowerCase()) ||
          exercise.target.toLowerCase().includes(query.toLowerCase()) ||
          exercise.bodyPart.toLowerCase().includes(query.toLowerCase())
      );

      return filtered; // Return filtered results
    } catch (err) {
      setError("Failed to search exercises");
      console.error("Error searching exercises:", err);
      return []; // On error, return empty result
    } finally {
      setLoading(false);
    }
  };

  // Return state and methods to the component that uses this hook
  return {
    exercises,
    bodyParts,
    quickWorkouts,
    loading,
    error,
    loadExercises,
    loadBodyParts,
    loadQuickWorkouts,
    searchExercises,
  };
};
