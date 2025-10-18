import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppDrawer from "./src/navigation/DrawerNavigation";
import { StatusBar } from "expo-status-bar";
import Onboarding from "./src/components/onboarding/Onboarding";

import { GestureHandlerRootView } from "react-native-gesture-handler";
export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {showOnboarding ? (
          <Onboarding onDone={() => setShowOnboarding(false)} />
        ) : (
          <AppDrawer /> // 👈 wraps your tabs with a drawer
        )}
      </NavigationContainer>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
