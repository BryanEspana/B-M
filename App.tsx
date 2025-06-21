import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NotFound from './src/pages/NotFound';
import Index from './src/pages/Index';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

export default function App() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5F3FF', '#7C3AED', '#9F1239']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Index">
              <Stack.Screen name="Index" component={Index} options={{ headerShown: false }} />
              <Stack.Screen name="NotFound" component={NotFound} />
            </Stack.Navigator>
          </NavigationContainer>
        </QueryClientProvider>
      </LinearGradient>
    </View>
  );
}