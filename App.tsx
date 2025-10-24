// App.tsx
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

import { AuthProvider, useAuth } from './src/store/AuthProvider';

const ONBOARDING_KEY = 'onboarding.done';

function Root() {
  const { user } = useAuth();              // null when signed out, User when signed in, undefined during first tick
  const [booting, setBooting] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);

  // Load onboarding flag once
  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        setShowOnboarding(done !== 'true'); // show onboarding only if not done
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting || user === undefined) {
    // Tiny splash while we read onboarding flag + wait for Firebase auth listener
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

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

  // After onboarding: if signed in → Drawer (main app); else → Auth screens
  return user ? <AppDrawer /> : <AuthNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <Root />
        </NavigationContainer>
      </AuthProvider>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}