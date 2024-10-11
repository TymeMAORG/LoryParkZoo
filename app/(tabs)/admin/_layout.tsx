import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function AdminTabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === 'index') {
            iconName = 'speedometer';
          } else if (route.name === 'settings') {
            iconName = 'settings';
          } else if (route.name === 'staff') {
            //iconName = 'profile';
          }
          else if (route.name === 'Species') {
            //iconName = 'profile';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          title: 'Staff',
        }}
      />
      <Tabs.Screen
        name="species"
        options={{
          title: 'Species',
        }}
      />
       <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
