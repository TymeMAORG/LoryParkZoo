import { Tabs } from "expo-router";
import React from "react";

export default function AnimalGroupLayout() {
  return (
    <Tabs
      screenOptions={() => ({
        headerShown: false,
        tabBarStyle: { display: "none" },
      })}
    >
      <Tabs.Screen
        name="bigcats"
        options={{
          title: "Big Cats",
        }}
      />
      <Tabs.Screen
        name="birds"
        options={{
          title: "Birds",
        }}
      />
      <Tabs.Screen
        name="birdsofprey"
        options={{
          title: "Birds of Prey",
        }}
      />
      <Tabs.Screen
        name="primates"
        options={{
          title: "Primates",
        }}
      />
      <Tabs.Screen
        name="reptiles"
        options={{
          title: "Reptiles",
        }}
      />
    </Tabs>
  );
}
