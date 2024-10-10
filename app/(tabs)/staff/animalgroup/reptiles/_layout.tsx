import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon } from 'react-native-elements';

export default function ReptilesLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'profile') {
            iconName = 'person';
          } else if (route.name === 'monitoring') {
            return <Icon name="spa" type="material" size={size} color={color} />;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reptiles',
        }}
      />
      <Tabs.Screen
        name="monitoring"
        options={{
          title: 'Monitoring',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
