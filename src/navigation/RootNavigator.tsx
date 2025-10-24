import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding from '../components/Onboarding';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Root = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        <Root.Screen name="Onboarding">
          {(props) => (
            <Onboarding
              {...props}
              onDone={() =>
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }],
                })
              }
            />
          )}
        </Root.Screen>

        <Root.Screen name="Auth" component={AuthNavigator} />
        <Root.Screen name="AppTabs" component={TabNavigator} />
      </Root.Navigator>
    </NavigationContainer>
  );
}