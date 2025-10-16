import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
      <StatusBar style="dark" />
    </>
  );
}