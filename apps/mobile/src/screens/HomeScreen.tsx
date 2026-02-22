import React, {useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { useAuthStore } from "../stores/authStore";
import { useVerificationStore } from "../stores/verificationStore";
import { useThemeStore, getThemeColors } from "../stores/themeStore";
import { apiClient } from "../api/client";

type RootStackParamList = {
  MainTabs: undefined;
  Onboarding: undefined;
};

type Props = StackScreenProps<RootStackParamList, "MainTabs">;

export default function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const verificationStore = useVerificationStore();
  const theme = useThemeStore((state) => state.theme);
  const colors = getThemeColors(theme);

  const [loadingStatus, setLoadingStatus] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchVerificationStatus();
    }, [])
  );

  const fetchVerificationStatus = async () => {
    try {
      setLoadingStatus(true);
      verificationStore.setLoading(true);
      const status = await apiClient.getVerificationStatus();
      verificationStore.setStatus(status.status, status.updatedAt);
    } catch (error: any) {
      const errorMsg = error?.error?.message || "Failed to fetch status";
      verificationStore.setError(errorMsg);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleStartOnboarding = () => {
    (navigation as any).navigate("Onboarding");
  };

  const getStatusColor = () => {
    switch (verificationStore.status) {
      case "APPROVED":
        return colors.success;
      case "REJECTED":
        return colors.error;
      case "IN_PROGRESS":
      case "MANUAL_REVIEW":
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  if (authStatus === "expired") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.centeredContent}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Session Expired
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            Please log in again to continue
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Welcome
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.fullName}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        {/* Verification Status */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.statusHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Verification Status
            </Text>
            {loadingStatus && <ActivityIndicator color={colors.primary} />}
          </View>

          {verificationStore.error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {verificationStore.error}
            </Text>
          ) : (
            <>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor() },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor() },
                  ]}
                >
                  {verificationStore.status}
                </Text>
              </View>

              {verificationStore.updatedAt && (
                <Text
                  style={[
                    styles.updatedAt,
                    { color: colors.textSecondary },
                  ]}
                >
                  Updated: {new Date(verificationStore.updatedAt).toLocaleString()}
                </Text>
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.refreshButton, { borderColor: colors.primary }]}
            onPress={fetchVerificationStatus}
            disabled={loadingStatus}
          >
            <Text style={[styles.refreshButtonText, { color: colors.primary }]}>
              {loadingStatus ? "Refreshing..." : "Refresh Status"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Onboarding Action */}
        {verificationStore.status === "NOT_STARTED" && (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Onboarding
            </Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Complete your identity verification to get started.
            </Text>
            <TouchableOpacity
              style={[
                styles.startButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleStartOnboarding}
            >
              <Text style={styles.startButtonText}>Start Onboarding</Text>
            </TouchableOpacity>
          </View>
        )}

        {verificationStore.status !== "NOT_STARTED" && (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Onboarding
            </Text>
            <TouchableOpacity
              style={[
                styles.resumeButton,
                { borderColor: colors.primary },
              ]}
              onPress={handleStartOnboarding}
            >
              <Text style={[styles.resumeButtonText, { color: colors.primary }]}>
                Review / Resume
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  updatedAt: {
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  refreshButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  startButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resumeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  resumeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
