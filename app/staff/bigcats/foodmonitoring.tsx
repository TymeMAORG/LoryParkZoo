import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { ref, get, set } from "firebase/database";
import { database } from "../../../firebaseConfig";

type BigCat = {
  id: string;
  name: string;
  species: string;
  section: string;
};

type FoodIntakeState = {
  [catName: string]: string;
};

const foodOptions = ["All", "3/4", "1/2", "1/4", "None"];

export default function FoodMonitoringSheet() {
  const [bigCats, setBigCats] = useState<BigCat[]>([]);
  const [foodIntake, setFoodIntake] = useState<FoodIntakeState>({});
  const [currentDate, setCurrentDate] = useState<string>("");

  // Fetch only "Big Cats" animals dynamically from Firebase
  useEffect(() => {
    const fetchBigCats = async () => {
      try {
        const animalsRef = ref(database, "animals");
        const snapshot = await get(animalsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const filteredCats = Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .filter((cat) => cat.section === "Big Cats"); // Filter for "Big Cats"
          setBigCats(filteredCats);
        } else {
          console.error("No animals found in the database.");
        }
      } catch (error) {
        console.error("Error fetching big cats:", error);
      }
    };

    fetchBigCats();
  }, []);

  // Set the current date and time
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toDateString();
    const timeStr = today.toLocaleTimeString();
    setCurrentDate(`${dateStr} - ${timeStr}`);
  }, []);

  // Handle selection of food intake for each cat
  const handleSelection = (catName: string, option: string) => {
    setFoodIntake((prev) => ({ ...prev, [catName]: option }));
  };

  // Save food intake data to Firebase
  const saveDataToFirebase = async () => {
    try {
      const foodMonitoringRef = ref(database, "Big Cat FoodMonitoring Sheet");
      await set(foodMonitoringRef, {
        date: currentDate,
        foodIntake,
      });
      Alert.alert("Success", "Food intake data saved successfully.");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save data.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Daily Food Monitoring Sheet</Text>
        <Text style={styles.dateText}>Date: {currentDate}</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.headerCell]}>Name / Species</Text>
          <Text style={[styles.cell, styles.headerCell]}>Leftover Food</Text>
        </View>
        {bigCats.map((cat) => (
          <View key={cat.id} style={styles.row}>
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
        <TouchableOpacity style={styles.saveButton} onPress={saveDataToFirebase}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

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
  saveButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
