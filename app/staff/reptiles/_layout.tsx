import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Icon } from "react-native-elements";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function ReptilesLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "index") {
            return (
              <MaterialCommunityIcons name="snake" size={24} color={color} />
            );
          } else if (route.name === "profile") {
            iconName = "person";
          } else if (route.name === "monitoring") {
            return (
              <Icon name="spa" type="material" size={size} color={color} />
            );
          } else if (route.name === "records") {
            return (
              <Ionicons name="document-text" size={size} color={color} />
            );
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Reptiles",
        }}
      />
      <Tabs.Screen
        name="monitoring"
        options={{
          title: "Monitoring",
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: "Records",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
