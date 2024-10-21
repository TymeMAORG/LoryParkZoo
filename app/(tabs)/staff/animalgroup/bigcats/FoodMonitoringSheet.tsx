import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

// Define types for the big cats data and food intake state
type BigCat = {
  name: string;
  species: string;
};

type FoodIntake = {
  [catName: string]: string;
};

const bigCats: BigCat[] = [
  { name: "DANIEL", species: "LION" },
  { name: "HEIN", species: "LION" },
  { name: "AMBER", species: "LION" },
  { name: "KIMBERLY", species: "TIGER" },
  { name: "JUPITER", species: "JAGUAR" },
  { name: "LEIA", species: "JAGUAR" },
  { name: "JACK", species: "LEOPARD" },
  { name: "JOHENSUU", species: "LEOPARD" },
  { name: "KRASIK", species: "LYNX" },
  { name: "DEBBY", species: "LYNX" },
];

const foodOptions: string[] = ["All", "3/4", "1/2", "1/4", "None"];

export default function FoodMonitoringSheet() {
  const [foodIntake, setFoodIntake] = useState<FoodIntake>({});
  const [currentDate, setCurrentDate] = useState<string>("");

  // Handle selection of food intake for each cat
  const handleSelection = (catName: string, option: string) => {
    setFoodIntake((prevState) => ({
      ...prevState,
      [catName]: option,
    }));
  };

  // Set the current date and time
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toDateString();
    const timeStr = today.toLocaleTimeString();
    setCurrentDate(`${dateStr} - ${timeStr}`);
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Date and Time Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Daily Food Monitoring Sheet for Big Cats
        </Text>
        <Text style={styles.dateText}>Date: {currentDate}</Text>
      </View>

      {/* Table for Big Cats and Food Intake */}
      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.row}>
          <Text style={[styles.cell, styles.headerCell]}>Name / Species</Text>
          <Text style={[styles.cell, styles.headerCell]}>Left Over food</Text>
        </View>

        {/* Data Rows */}
        {bigCats.map((cat, index) => (
          <View key={index} style={styles.row}>
            <Text style={[styles.cell, styles.catCell]}>
              {cat.name} / {cat.species}
            </Text>
            <View style={styles.foodOptions}>
              {foodOptions.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionButton,
                    foodIntake[cat.name] === option && styles.selectedButton,
                  ]}
                  onPress={() => handleSelection(cat.name, option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      foodIntake[cat.name] === option && styles.selectedText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f4f7", // Light background color
  },
  header: {
    marginBottom: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  dateText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginTop: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  headerCell: {
    fontWeight: "bold",
    backgroundColor: "#fafafa",
    fontSize: 16,
    paddingVertical: 10,
    textAlign: "center",
  },
  catCell: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  foodOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
  },
  optionButton: {
    backgroundColor: "#ddd",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  selectedButton: {
    backgroundColor: "#4CAF50", // Selected button background color
  },
  optionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedText: {
    color: "#fff", // Selected text color
  },
});
