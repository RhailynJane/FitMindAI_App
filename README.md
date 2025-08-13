# FitMindAI

This is a comprehensive fitness application built with [Expo](https://expo.dev) and React Native, created using [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Features

- **Workout Tracking**: Create and track custom workout plans
- **Challenges System**: Join fitness challenges with progress tracking
- **AI-Powered Features**: Personalized challenge generation using OpenAI, AI coach insights
- **User Profiles**: Track fitness goals and achievements
- **Exercise Library**: Browse exercises by body part
- **Progress Visualization**: Charts and stats for workout history

## Key Components

1. **Tab Navigation**: Custom styled bottom tab bar with 5 main sections:

   - Dashboard
   - Workouts
   - Workout Plans
   - Challenges
   - Profile

2. **Challenges System**:

   - Pre-defined and AI-generated challenges
   - Progress tracking with visual indicators
   - Reward system with XP points

3. **Workout Management**:
   - Create custom workout plans
   - Track workout sessions
   - Exercise library with body part filtering

## Screens

### Dashboard

- Welcome message with user stats
- Active challenge progress
- Quick workout access
- AI coach insights

### Workouts

- Browse exercises by body part
- Quick workout suggestions
- Exercise details and instructions

### Workout Plans

- Create and manage custom workout plans
- Start/continue workout sessions
- Track completion progress

### Challenges

- Join community challenges
- Generate personalized AI challenges
- Track active and completed challenges

### Profile

- User information
- Fitness goals
- Settings and preferences
- Logout functionality

## Technical Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router with file-based routing
- **Styling**: StyleSheet with responsive design
- **Icons**: Expo Vector Icons
- **AI Integration**: OpenAI API for personalized challenges and AI Coach
- **State Management**: React hooks and context
- **Backend**: Firebase Firestore

## Get Started

1. Install dependencies: `npm install`
2. Create `.env` file with `EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here`
3. Start the app: `npx expo start`

## Project Structure

app/
(tabs)/ # Main tab navigation
dashboard.tsx # Home screen with stats
workout.tsx # Exercise browser
workout-plans/ # Custom workout plans
challenges.tsx # Fitness challenges
profile.tsx # User profile
components/ # Shared UI components
hooks/ # Custom hooks
services/ # API and Firebase services

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
