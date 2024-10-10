import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function AnimalGroupLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          // if (route.name === 'bigcats') {
          //   iconName = 'paw';
          // } else if (route.name === 'birds') {
          //   iconName = 'bird';
          // } else if (route.name === 'birdsofprey') {
          //   iconName = 'eagle';
          // } else if (route.name === 'primates') {
          //   iconName = 'monkey';
          // } else if (route.name === 'reptiles') {
          //   iconName = 'snake';
          // }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarStyle: { display: 'none' },
      })}
    >
      <Tabs.Screen
        name="bigcats"
        options={{
          title: 'Big Cats',
        }}
      />
      <Tabs.Screen
        name="birds"
        options={{
          title: 'Birds',
        }}
      />
      <Tabs.Screen
        name="birdsofprey"
        options={{
          title: 'Birds of Prey',
        }}
      />
      <Tabs.Screen
        name="primates"
        options={{
          title: 'Primates',
        }}
      />
      <Tabs.Screen
        name="reptiles"
        options={{
          title: 'Reptiles',
        }}
      />
    </Tabs>
  );
}
