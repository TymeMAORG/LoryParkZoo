import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { ref, get, push, set, child } from "firebase/database"; // Ensure 'set' is imported
import { database } from "../../../firebaseConfig";

type Primate = {
  id: string;
  name: string;
};

export default function PrimateFeedingForm() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [primates, setPrimates] = useState<Primate[]>([]);
  const [selectedPrimate, setSelectedPrimate] = useState<string>("");
  const [feedingDetails, setFeedingDetails] = useState<string>("");
  const [healthStatus, setHealthStatus] = useState<string>("");

  // Fetch primates dynamically from Firebase
  useEffect(() => {
    const fetchPrimates = async () => {
      try {
        const primatesRef = ref(database, "animals");
        const snapshot = await get(primatesRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const filteredPrimates = Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .filter((primate) => primate.section === "Primates"); // Filter for "Primates"
          setPrimates(filteredPrimates);
        } else {
          console.error("No primates found in the database.");
        }
      } catch (error) {
        console.error("Error fetching primates:", error);
      }
    };

    fetchPrimates();
  }, []);

  // Set the current date
  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toDateString());
  }, []);

  // Save feeding data to Firebase
  const handleSave = async () => {
    if (!selectedPrimate || !feedingDetails || !healthStatus) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const feedingRef = ref(database, "Primates Feeding Form");
      const newFeedingRef = push(child(feedingRef, selectedPrimate));  // Use push to add a new entry
      await set(newFeedingRef, {  // Use 'set' to save data at the new reference
        date: currentDate,
        feedingDetails,
        healthStatus,
      });
      Alert.alert("Success", "Feeding data saved successfully.");
      clearForm();
    } catch (error) {
      console.error("Error saving feeding data:", error);
      Alert.alert("Error", "Failed to save feeding data.");
    }
  };

  // Clear form after saving
  const clearForm = () => {
    setSelectedPrimate("");
    setFeedingDetails("");
    setHealthStatus("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Primate Feeding Form</Text>
      <Text style={styles.label}>Date: {currentDate}</Text>

      <Text style={styles.label}>Select Primate</Text>
      <ScrollView horizontal style={styles.primatePicker}>
        {primates.map((primate) => (
          <TouchableOpacity
            key={primate.id}
            style={[
              styles.primateButton,
              selectedPrimate === primate.name && styles.selectedPrimateButton,
            ]}
            onPress={() => setSelectedPrimate(primate.name)}
          >
            <Text
              style={[
                styles.primateButtonText,
                selectedPrimate === primate.name && styles.selectedPrimateText,
              ]}
            >
              {primate.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        placeholder="Enter Feeding Details"
        value={feedingDetails}
        onChangeText={setFeedingDetails}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Health Status"
        value={healthStatus}
        onChangeText={setHealthStatus}
        multiline
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Feeding</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9", // Light background
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#3498db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  primatePicker: {
    flexDirection: "row",
    marginBottom: 20,
  },
  primateButton: {
    backgroundColor: "#ecf0f1",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedPrimateButton: {
    backgroundColor: "#3498db",
  },
  primateButtonText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  selectedPrimateText: {
    color: "#ffffff",
  },
  saveButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
});
