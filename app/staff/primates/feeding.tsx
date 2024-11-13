import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { format } from "date-fns"; // for formatting the date

export default function FeedingForm() {
  const [currentDate, setCurrentDate] = useState("");
  const [primateName, setPrimateName] = useState("");
  const [feedingDetails, setFeedingDetails] = useState("");
  const [healthStatus, setHealthStatus] = useState("");

  useEffect(() => {
    const today = new Date();
    setCurrentDate(format(today, "yyyy-MM-dd"));
  }, []);

  const handleSave = () => {
    console.log(`Date: ${currentDate}`);
    console.log(`Primate: ${primateName}`);
    console.log(`Feeding Details: ${feedingDetails}`);
    console.log(`Health Status: ${healthStatus}`);
    setPrimateName("");
    setFeedingDetails("");
    setHealthStatus("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Feeding</Text>
      <Text style={styles.label}>Date: {currentDate}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Primate Name"
        value={primateName}
        onChangeText={setPrimateName}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f8ff", // Light blue background
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50", // Dark blue title color
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    color: "#34495e", // Darker gray for date label
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#3498db", // Blue border for inputs
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#3498db", // Blue button color
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
