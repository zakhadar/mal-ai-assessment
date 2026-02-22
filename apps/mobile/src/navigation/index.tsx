import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SessionExpiredScreen from "../screens/SessionExpiredScreen";
import { useAuthStore } from "../stores/authStore";

const Stack = createStackNavigator<any>();
const Tab = createBottomTabNavigator<any>();

// Auth Stack (unauthenticated users)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen as any} />
    </Stack.Navigator>
  );
}

// Session Expired Stack
function SessionExpiredStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="SessionExpired" component={SessionExpiredScreen as any} />
    </Stack.Navigator>
  );
}

// App Stack (authenticated users)
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen as any}
        options={{
          title: "Home",
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen as any}
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={AppTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen as any}
        options={{
          title: "Onboarding",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
}

// Root Navigator with Route Guards
export function RootNavigator() {
  const authStatus = useAuthStore((state) => state.status);

  return (
    <NavigationContainer>
      {authStatus === "expired" && <SessionExpiredStack />}
      {authStatus === "logged_in" && <AppStack />}
      {(authStatus === "logged_out" || authStatus === "logging_in" || authStatus === "refreshing") && <AuthStack />}
    </NavigationContainer>
  );
}

