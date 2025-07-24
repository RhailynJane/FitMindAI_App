"use client"

import { useEffect } from "react"
import { useRouter } from "expo-router"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { useAuth } from "../hooks/useAuth"

export default function Index() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log("User authenticated, redirecting to dashboard")
        router.replace("/(tabs)/dashboard")
      } else {
        console.log("No user found, redirecting to welcome")
        router.replace("/welcome")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9512af" />
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#efdff1",
  },
})
