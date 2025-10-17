import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./src/navigation/TabNavigator";
import { StatusBar } from "expo-status-bar";
import Onboarding from "./src/components/Onboarding";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleFinishOnboarding = () => setShowOnboarding(false);

  return (
    <>
      <NavigationContainer>
        {showOnboarding ? (
          <Onboarding onDone={handleFinishOnboarding} />
        ) : (
          <TabNavigator />
        )}
      </NavigationContainer>
      <StatusBar style="dark" />
    </>
  );
}
