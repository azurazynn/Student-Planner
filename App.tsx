import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './AppContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    // AppProvider must be OUTSIDE NavigationContainer
    // so all screens can access context via useApp()
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}