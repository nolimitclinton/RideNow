// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding from '../components/onboarding/Onboarding';
import AuthNavigator from './AuthNavigator';
import AppDrawer from './DrawerNavigation';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import { auth } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  VerifyEmail: undefined;
  App: undefined;
};

const Root = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [user, setUser] = React.useState<User | null>(null);
  const [booted, setBooted] = React.useState(false);
  const [finishedOnboarding, setFinishedOnboarding] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setBooted(true);
    });
    return unsub;
  }, []);

  if (!booted) return null;

  const isPasswordUser = !!user?.providerData.some(p => p.providerId === 'password');
  const needsVerify = !!user && isPasswordUser && !user.emailVerified;

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!finishedOnboarding ? (
          <Root.Screen name="Onboarding">
            {(props) => (
              <Onboarding
                {...props}
                onDone={() => setFinishedOnboarding(true)}
              />
            )}
          </Root.Screen>
        ) : !user ? (
          <Root.Screen name="Auth" component={AuthNavigator} />
        ) : needsVerify ? (
          <Root.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        ) : (
          <Root.Screen name="App" component={AppDrawer} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}