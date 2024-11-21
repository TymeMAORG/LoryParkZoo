import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function PrimateLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: "home" | "person" | "nutrition" = "home";

          if (route.name === "index") {
            iconName = "home";
          } else if (route.name === "feeding") {
            iconName = "nutrition";
          } else if (route.name === "profile") {
            iconName = "person";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Primates" }}
      />
      <Tabs.Screen
        name="feeding" // It will look for feeding.tsx in the same folder
        options={{ title: "Record Feeding" }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: "Feeding Records",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
      
    </Tabs>
  );
}
