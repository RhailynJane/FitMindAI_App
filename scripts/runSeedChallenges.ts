"use client";
import { useState } from "react";
import { exerciseApi, type Exercise } from "../services/exerciseApi";
import {
  workoutGenerator,
  type GeneratedWorkout,
} from "../services/workoutGenerator";

export const useExerciseData = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [quickWorkouts, setQuickWorkouts] = useState<GeneratedWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExercises = async (limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      const data = await exerciseApi.getAllExercises(limit);
      setExercises(data);
    } catch (err) {
      setError("Failed to load exercises");
      console.error("Error loading exercises:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBodyParts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exerciseApi.getBodyParts();
      setBodyParts(data);
    } catch (err) {
      setError("Failed to load body parts");
      console.error("Error loading body parts:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuickWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workoutGenerator.getQuickWorkouts();
      setQuickWorkouts(data);
    } catch (err) {
      setError("Failed to load workouts");
      console.error("Error loading workouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchExercises = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      // For now, we'll filter existing exercises
      // In a real app, you might have a search endpoint
      const filtered = exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query.toLowerCase()) ||
          exercise.target.toLowerCase().includes(query.toLowerCase()) ||
          exercise.bodyPart.toLowerCase().includes(query.toLowerCase())
      );
      return filtered;
    } catch (err) {
      setError("Failed to search exercises");
      console.error("Error searching exercises:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

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
