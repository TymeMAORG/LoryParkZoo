import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Icon from '@mdi/react';
import { mdiBird } from '@mdi/js';

export default function BirdsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

            if (route.name === 'index') {
            return <Icon path={mdiBird} size={size} color={color} />;
          } else if (route.name === 'profile') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Birds',
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
