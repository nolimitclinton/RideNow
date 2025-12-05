import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Onboarding from './src/components/onboarding/Onboarding';
import AppDrawer from './src/navigation/DrawerNavigation';
import AuthNavigator from './src/navigation/AuthNavigator';
import VerifyEmailScreen from './src/screens/auth/VerifyEmailScreen';
import { AuthProvider, useAuth } from './src/store/AuthProvider';
import { ThemeProvider, useTheme } from './src/store/ThemeProvider';

const ONBOARDING_KEY = 'onboarding.done';

function Root() {
  const { user, verified, authReady } = useAuth(); 
  const [booting, setBooting] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        setShowOnboarding(done !== 'true');
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  // Splash screen while initializing
  if (booting || !authReady || user === undefined) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}

  // Show onboarding once
  if (showOnboarding) {
    return (
      <Onboarding
        onDone={async () => {
          await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
          setShowOnboarding(false);
        }}
      />
    );
  }

  // Route logic
  if (!user) return <AuthNavigator />;     // user not signed in
  if (!verified) return <VerifyEmailScreen />; // signed in but not verified
  return <AppDrawer />;                    // verified → main app
}

export default function App() {
  // A small component inside ThemeProvider to read theme and set StatusBar accordingly
  const ThemeAwareStatusBar: React.FC = () => {
    const { themeMode, theme } = useTheme();
    
    return <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.background} />;
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
  
          <ThemeAwareStatusBar />
          <NavigationContainer>
            <Root />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
      
    </GestureHandlerRootView>
  );
}