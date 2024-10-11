import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Icon from '@mdi/react';
import { Icon as Icon2 } from 'react-native-elements';
import { mdiBird } from '@mdi/js';

export default function BirdsofPreyLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

            if (route.name === 'index') {
            return <Icon path={mdiBird} size={1} color={color} />;
          } else if (route.name === 'foodmonitoring'){
            return <Icon2 name="restaurant" type="material" size={size} color={color} />;
          }
          else if (route.name === 'profile') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Birds of Prey',
        }}
      />
      <Tabs.Screen
        name = "foodmonitoring"
        options={{
          title: 'Food Monitoring',
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
