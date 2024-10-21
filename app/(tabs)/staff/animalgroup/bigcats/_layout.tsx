import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Icon } from "react-native-elements";

export default function BigCatsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "FoodMonitoringSheet") {
            return (
              <Icon
                name="restaurant"
                type="material"
                size={size}
                color={color}
              />
            );
          } else {
            let iconName: any;
            if (route.name === "index") {
              return (
                <Icon name="pets" type="material" size={size} color={color} />
              );
            } else if (route.name === "profile") {
              iconName = "person";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Big Cats",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Tabs.Screen
        name="FoodMonitoringSheet"
        options={{
          title: "Food Monitoring",
        }}
      />
    </Tabs>
  );
}
