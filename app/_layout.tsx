import { Stack } from "expo-router";
import { useEffect } from 'react';
import { useUserStore } from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function Layout() {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    // Check for stored user data on app launch
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUser(user.username, user.section, user.isAdmin);
          if (user.isAdmin) {
            router.replace('/admin/dashboard');
          } else {
            router.replace('./');
          }
        }

      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUser();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="admin" 
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="staff" 
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
    </Stack>
  );
}
