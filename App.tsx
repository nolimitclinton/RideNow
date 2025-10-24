import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator'; 
import { StatusBar } from 'expo-status-bar';
import Onboarding from './src/components/Onboarding';
import { AuthProvider, useAuth } from './src/store/AuthProvider'; 

function Root() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { user } = useAuth();

  if (showOnboarding) {
    return (
      <NavigationContainer>
        <Onboarding onDone={() => setShowOnboarding(false)} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <>
      <AuthProvider>
        <Root />
      </AuthProvider>
      <StatusBar style="dark" />
    </>
  );
}