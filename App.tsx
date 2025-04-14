import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UploadScreen from './src/screens/UploadScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import MapScreen from './src/screens/MapScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';

const Stack = createNativeStackNavigator();

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {/* user is authenticated or not */}
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="Gallery" component={GalleryScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => (
  <AuthProvider>
    <NavigationContainer>
      <AppRoutes />
    </NavigationContainer>
  </AuthProvider>
);

export default App;