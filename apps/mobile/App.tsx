import { useEffect } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation";
import { useAuthStore } from "./src/stores/authStore";
import { useThemeStore, getThemeColors } from "./src/stores/themeStore";

export default function App() {
  const authStatus = useAuthStore((state) => state.status);
  const theme = useThemeStore((state) => state.theme);
  const colors = getThemeColors(theme);

  const isLoggedIn = authStatus === "logged_in";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <RootNavigator isLoggedIn={isLoggedIn} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
