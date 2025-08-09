import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useAuthFunctions } from "../../hooks/useAuthFunctions";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { getUserProfile, updateUserProfile } = useAuthFunctions();

  const [loading, setLoading] = useState(true);
  const [masterNotifications, setMasterNotifications] = useState(true);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "workouts",
      title: "Workout Reminders",
      description: "Get reminded about your scheduled workouts",
      icon: "fitness-outline",
      enabled: true,
    },
    {
      id: "achievements",
      title: "Achievements",
      description: "Celebrate when you unlock new achievements",
      icon: "trophy-outline",
      enabled: true,
    },
    {
      id: "streaks",
      title: "Streak Alerts",
      description: "Don't break your workout streak",
      icon: "flame-outline",
      enabled: true,
    },
    {
      id: "progress",
      title: "Progress Updates",
      description: "Weekly summaries of your fitness journey",
      icon: "trending-up-outline",
      enabled: false,
    },
    {
      id: "rest",
      title: "Rest Day Reminders",
      description: "Important reminders to take rest days",
      icon: "bed-outline",
      enabled: true,
    },
    {
      id: "challenges",
      title: "Challenge Updates",
      description: "Updates about fitness challenges",
      icon: "medal-outline",
      enabled: true,
    },
  ]);

  // Load settings from Firestore on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.notifications) {
          setMasterNotifications(profile.notifications.master ?? true);
          setSettings(
            (profile.notifications.settings ?? settings).map((s: any) => ({
              ...s,
              icon: s.icon as keyof typeof Ionicons.glyphMap,
            }))
          );
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user]);

  const saveNotificationSettings = async (
    newMaster: boolean,
    newSettings: NotificationSetting[]
  ) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, {
        notifications: {
          master: newMaster,
          settings: newSettings,
        },
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const toggleMasterNotifications = () => {
    const newValue = !masterNotifications;
    const updatedSettings = newValue
      ? settings
      : settings.map((s) => ({ ...s, enabled: false }));

    setMasterNotifications(newValue);
    setSettings(updatedSettings);
    saveNotificationSettings(newValue, updatedSettings);

    if (!newValue) {
      Alert.alert(
        "Notifications Disabled",
        "All notification types have been disabled."
      );
    }
  };

  const toggleSetting = (id: string) => {
    if (!masterNotifications) {
      Alert.alert(
        "Enable Notifications",
        "Please enable notifications first to modify individual settings."
      );
      return;
    }

    const updatedSettings = settings.map((setting) =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );

    setSettings(updatedSettings);
    saveNotificationSettings(masterNotifications, updatedSettings);
  };

  const getEnabledCount = () =>
    settings.filter((setting) => setting.enabled).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Master Toggle */}
        <View style={styles.masterSection}>
          <View style={styles.masterHeader}>
            <Ionicons
              name={masterNotifications ? "notifications" : "notifications-off"}
              size={24}
              color="#9512af"
            />
            <View style={styles.masterTextContainer}>
              <Text style={styles.masterTitle}>Push Notifications</Text>
              <Text style={styles.masterSubtitle}>
                {masterNotifications
                  ? `${getEnabledCount()} of ${settings.length} types enabled`
                  : "All notifications disabled"}
              </Text>
            </View>
            <Switch
              value={masterNotifications}
              onValueChange={toggleMasterNotifications}
              trackColor={{ false: "#e0e0e0", true: "#9512af30" }}
              thumbColor={masterNotifications ? "#9512af" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Individual Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          {settings.map((setting) => (
            <View key={setting.id} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { opacity: masterNotifications ? 1 : 0.5 },
                  ]}
                >
                  <Ionicons
                    name={setting.icon}
                    size={20}
                    color={
                      setting.enabled && masterNotifications
                        ? "#9512af"
                        : "#666"
                    }
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text
                    style={[
                      styles.settingTitle,
                      { opacity: masterNotifications ? 1 : 0.5 },
                    ]}
                  >
                    {setting.title}
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { opacity: masterNotifications ? 1 : 0.5 },
                    ]}
                  >
                    {setting.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={setting.enabled && masterNotifications}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: "#e0e0e0", true: "#9512af30" }}
                thumbColor={
                  setting.enabled && masterNotifications ? "#9512af" : "#f4f3f4"
                }
                disabled={!masterNotifications}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  masterSection: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  masterHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  masterTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  masterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  masterSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  settingsSection: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    padding: 20,
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  infoSection: {
    margin: 20,
    marginBottom: 40,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginLeft: 10,
  },
  systemSettingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  systemSettingsText: {
    flex: 1,
    fontSize: 16,
    color: "#9512af",
    fontWeight: "500",
    marginLeft: 10,
  },
});
