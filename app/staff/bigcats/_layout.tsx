import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Icon } from "react-native-elements";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function BigCatsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "foodmonitoring") {
            return (
              <Icon
                name="restaurant"
                type="material"
                size={size}
                color={color}
              />
            );
          } else if (route.name === "taskmanagement") {
            return (
              <Icon
                name="assignment"
                type="material"
                size={size}
                color={color}
              />
            );
          } else {
            let iconName: any;
            if (route.name === "index") {
              return (
                <MaterialCommunityIcons name="cat" size={size} color={color} />
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
        name="foodmonitoring"
        options={{
          title: "Food Monitoring",
        }}
      />
      <Tabs.Screen
        name="taskmanagement"
        options={{
          title: "Tasks",
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
