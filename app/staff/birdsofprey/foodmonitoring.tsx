import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ToastManager, { Toast } from "toastify-react-native";

type BirdOfPrey = {
  name: string;
  species: string;
};

type FoodIntake = {
  [birdName: string]: string;
};

const birdsOfPrey: BirdOfPrey[] = [
  { name: "Sky", species: "Bald Eagle" },
  { name: "Thor", species: "Golden Eagle" },
  { name: "Zeus", species: "Vulture" },
  { name: "Athena", species: "Vulture" },
  { name: "Ares", species: "Falcon" },
  { name: "Apollo", species: "Falcon" },
];

const foodOptions: string[] = ["All", "3/4", "1/2", "1/4", "None"];

export default function FoodMonitoring() {
  const [foodIntake, setFoodIntake] = useState<FoodIntake>({});
  const [currentDate, setCurrentDate] = useState<string>("");
  const { keeper } = useLocalSearchParams();

  const showToast = () => {
    Toast.success("Form Submitted Successfully!");
  };

  useEffect(() => {
    const today = new Date();
    const dateStr = today.toDateString();
    const timeStr = today.toLocaleTimeString();
    setCurrentDate(`${dateStr} - ${timeStr}`);
  }, []);

  const handleSelection = (birdName: string, option: string) => {
    setFoodIntake((prevState) => ({
      ...prevState,
      [birdName]: option,
    }));
  };

  const handleSave = () => {
    console.log("Date:", currentDate);
    console.log("Keeper:", keeper);
    console.log("Food Intake:", foodIntake);
    showToast();
  };

  return (
    <ScrollView style={styles.container}>
      <ToastManager />
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Daily Food Monitoring Sheet for Birds of Prey
        </Text>
        <Text style={styles.dateText}>Date: {currentDate}</Text>
        <Text style={styles.dateText}>Keeper: {keeper}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.headerCell]}>Name / Species</Text>
          <Text style={[styles.cell, styles.headerCell]}>Leftover Food</Text>
        </View>

        {birdsOfPrey.map((bird, index) => (
          <View key={index} style={styles.row}>
            <Text style={[styles.cell, styles.birdCell]}>
              {bird.name} / {bird.species}
            </Text>
            <View style={styles.foodOptions}>
              {foodOptions.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionButton,
                    foodIntake[bird.name] === option && styles.selectedOption
                  ]}
                  onPress={() => handleSelection(bird.name, option)}
                >
                  <Text style={[
                    styles.optionText,
                    foodIntake[bird.name] === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f4f7",
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
  birdCell: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  foodOptions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  optionButton: {
    padding: 8,
    margin: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedOption: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 12,
    color: "#333",
  },
  selectedOptionText: {
    color: "#fff",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});