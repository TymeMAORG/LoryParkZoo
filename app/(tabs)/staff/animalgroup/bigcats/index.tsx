import React from "react";
import { View, Text, StyleSheet } from "react-native";

import FoodMonitoringSheet from "./FoodMonitoringSheet";

export default function BigCatsHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Big Cats Home</Text>
      {/* Include the Food Monitoring Sheet */}
      {/* <FoodMonitoringSheet />*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
