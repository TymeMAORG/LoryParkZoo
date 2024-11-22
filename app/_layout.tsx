import { Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { useUserStore } from './index';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

// Import AsyncStorage after installation
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout() {
  const setUser = useUserStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app launch
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUser(user.username, user.section, user.isAdmin);
          // Add a small delay to ensure state is updated
          setTimeout(() => {
            if (user.isAdmin) {
              router.replace('/admin/');
            } else {
              router.replace('/');
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none', // Disable animations to prevent transition issues
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="admin" 
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
