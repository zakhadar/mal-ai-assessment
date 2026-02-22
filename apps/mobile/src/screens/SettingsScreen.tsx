import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore, getThemeColors } from "../stores/themeStore";
import { Theme } from "@mal-assessment/shared";

export default function SettingsScreen() {
  const authStore = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const colors = getThemeColors(theme);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          authStore.setLoggedOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Theme Settings */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Appearance
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {theme === "dark" ? "Enabled" : "Disabled"}
              </Text>
            </View>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={theme === "dark" ? colors.primary : colors.surface}
            />
          </View>
        </View>

        {/* Account Settings */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Account
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Email
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {authStore.user?.email}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { borderColor: colors.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Full Name
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {authStore.user?.fullName}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { borderColor: colors.error },
          ]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: colors.error }]}>
            Log Out
          </Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoTitle, { color: colors.textSecondary }]}>
            eKYC Mobile
          </Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    flex: 1,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLabel: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  divider: {
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  appInfo: {
    alignItems: "center",
    marginTop: "auto",
    gap: 4,
  },
  appInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  appVersion: {
    fontSize: 12,
  },
});
