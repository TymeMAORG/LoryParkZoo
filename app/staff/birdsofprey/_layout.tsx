import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Icon } from "react-native-elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BirdsofPreyLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "index") {
            return (
              <MaterialCommunityIcons name="bird" size={size} color={color} />
            );
          } else if (route.name === "foodmonitoring") {
            return (
              <Icon
                name="restaurant"
                type="material"
                size={size}
                color={color}
              />
            );
          } else if (route.name === "profile") {
            iconName = "person";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Birds of Prey",
        }}
      />
      <Tabs.Screen
        name="foodmonitoring"
        options={{
          title: "Food Monitoring",
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
