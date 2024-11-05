import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import ToastManager, { Toast } from "toastify-react-native";

// Define types for the birds of prey data and food intake state
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
              <Picker
                selectedValue={foodIntake[bird.name]}
                style={styles.picker}
                onValueChange={(itemValue: string) =>
                  handleSelection(bird.name, itemValue)
                }
              >
                {foodOptions.map((option, optionIndex) => (
                  <Picker.Item
                    key={optionIndex}
                    label={option}
                    value={option}
                  />
                ))}
              </Picker>
            </View>
          </View>
        ))}
      </View>

      {/* Save button */}
      <View style={styles.saveButton}>
        <Button title="Save" onPress={handleSave} />
      </View>
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
    justifyContent: "center",
  },
  picker: {
    height: 40,
    width: 150,
  },
  saveButton: {
    marginTop: 20,
    alignItems: "center",
  },
});
