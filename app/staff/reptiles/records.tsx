import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ref, get, update, onValue, off } from "firebase/database";
import { database } from "../../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

type MonitoringRecord = {
  timestamp: string;
  temperature: string;
  humidity: string;
  health: string;
  foodOfferedQuantity: string;
  foodType: string;
  foodTaken: string;
  regurgitating: boolean;
  faeces: boolean;
  inBlue: boolean;
  shed: boolean;
  clean: boolean;
  urine: boolean;
  water: boolean;
  observation: string;
  animalName: string;
  species: string;
  enclosure: string;
  lastEdited?: string;
};

type GroupedRecords = {
  [date: string]: {
    [reptile: string]: {
      [key: string]: MonitoringRecord;
    };
  };
};

export default function ReptileRecords() {
  const [records, setRecords] = useState<GroupedRecords>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{
    date: string;
    reptile: string;
    recordKey: string;
    record: MonitoringRecord;
  } | null>(null);
  const [editedHealth, setEditedHealth] = useState("");
  const [editedObservation, setEditedObservation] = useState("");
  const [editedTemperature, setEditedTemperature] = useState("");
  const [editedHumidity, setEditedHumidity] = useState("");
  const [editedFoodOffered, setEditedFoodOffered] = useState("");
  const [editedFoodTaken, setEditedFoodTaken] = useState("");

  useEffect(() => {
    console.log('Setting up real-time listener for reptile monitoring records');
    const recordsRef = ref(database, "Reptiles Monitoring Records");
    
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Received monitoring records update:', {
          numberOfDates: Object.keys(data).length,
          dates: Object.keys(data)
        });
        setRecords(data);
      } else {
        console.log('No monitoring records found');
        setRecords({});
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching monitoring records:", error);
      Alert.alert("Error", "Failed to load monitoring records");
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up monitoring records listener');
      off(recordsRef);
    };
  }, []);

  const handleEdit = (date: string, reptile: string, recordKey: string, record: MonitoringRecord) => {
    console.log('Editing record:', { date, reptile, recordKey, record });
    setEditingRecord({ date, reptile, recordKey, record });
    setEditedHealth(record.health);
    setEditedObservation(record.observation || "");
    setEditedTemperature(record.temperature);
    setEditedHumidity(record.humidity);
    setEditedFoodOffered(record.foodOfferedQuantity);
    setEditedFoodTaken(record.foodTaken);
    setModalVisible(true);
  };

  const validateEditForm = () => {
    // Validate temperature range
    const temp = parseFloat(editedTemperature);
    if (isNaN(temp) || temp < -50 || temp > 50) {
      Alert.alert("Error", "Temperature must be between -50°C and 50°C");
      return false;
    }

    // Validate humidity range
    const humidity = parseFloat(editedHumidity);
    if (isNaN(humidity) || humidity < 0 || humidity > 100) {
      Alert.alert("Error", "Humidity must be between 0% and 100%");
      return false;
    }

    return true;
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) {
      console.warn('Attempted to save edit with no active editing record');
      return;
    }

    if (!validateEditForm()) {
      return;
    }

    try {
      const { date, reptile, recordKey } = editingRecord;
      console.log('Updating record at path:', `Reptiles Monitoring Records/${date}/${reptile}/${recordKey}`);
      
      const recordRef = ref(
        database,
        `Reptiles Monitoring Records/${date}/${reptile}/${recordKey}`
      );

      const updatedData = {
        ...editingRecord.record,
        temperature: editedTemperature,
        humidity: editedHumidity,
        health: editedHealth,
        foodOfferedQuantity: editedFoodOffered,
        foodTaken: editedFoodTaken,
        observation: editedObservation.trim(),
        lastEdited: new Date().toISOString(),
      };

      await update(recordRef, updatedData);
      console.log('Record updated successfully');
      Alert.alert("Success", "Record updated successfully");
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating record:", error);
      Alert.alert("Error", "Failed to update record");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Monitoring Records</Text>
        {Object.entries(records)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([date, reptileRecords]) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{new Date(date).toDateString()}</Text>
              {Object.entries(reptileRecords).map(([reptile, monitoringRecords]) => (
                <View key={reptile} style={styles.reptileSection}>
                  <Text style={styles.reptileHeader}>
                    {reptile} - {Object.values(monitoringRecords)[0].species}
                  </Text>
                  <Text style={styles.enclosureText}>
                    Enclosure: {Object.values(monitoringRecords)[0].enclosure}
                  </Text>
                  {Object.entries(monitoringRecords).map(([recordKey, record]) => (
                    <View key={recordKey} style={styles.recordCard}>
                      <View style={styles.recordHeader}>
                        <Text style={styles.timestamp}>
                          <Text style={styles.label}>Time Recorded: </Text>
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleEdit(date, reptile, recordKey, record)}
                          style={styles.editButton}
                        >
                          <Ionicons name="pencil" size={20} color="#3498db" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.details}>
                        <Text style={styles.label}>Temperature: </Text>
                        {record.temperature}°C
                      </Text>

                      <Text style={styles.details}>
                        <Text style={styles.label}>Humidity: </Text>
                        {record.humidity}%
                      </Text>

                      <Text style={styles.details}>
                        <Text style={styles.label}>Health: </Text>
                        {record.health}
                      </Text>

                      {record.foodOfferedQuantity && (
                        <Text style={styles.details}>
                          <Text style={styles.label}>Food Offered: </Text>
                          {record.foodOfferedQuantity} {record.foodType}
                        </Text>
                      )}

                      {record.foodTaken && (
                        <Text style={styles.details}>
                          <Text style={styles.label}>Food Taken: </Text>
                          {record.foodTaken}
                        </Text>
                      )}

                      <View style={styles.checkboxGroup}>
                        {record.regurgitating && <Text style={styles.tag}>Regurgitating</Text>}
                        {record.faeces && <Text style={styles.tag}>Faeces</Text>}
                        {record.inBlue && <Text style={styles.tag}>In Blue</Text>}
                        {record.shed && <Text style={styles.tag}>Shedding</Text>}
                        {record.clean && <Text style={styles.tag}>Clean</Text>}
                        {record.urine && <Text style={styles.tag}>Urine</Text>}
                        {record.water && <Text style={styles.tag}>Water</Text>}
                      </View>

                      {record.observation && (
                        <Text style={styles.observation}>
                          <Text style={styles.label}>Observations: </Text>
                          {record.observation}
                        </Text>
                      )}

                      {record.lastEdited && (
                        <Text style={styles.editedTimestamp}>
                          Last edited: {new Date(record.lastEdited).toLocaleString()}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Record</Text>
            
            <Text style={styles.modalLabel}>Temperature (°C):</Text>
            <TextInput
              style={styles.modalInput}
              value={editedTemperature}
              onChangeText={setEditedTemperature}
              placeholder="Enter temperature"
              keyboardType="numeric"
            />

            <Text style={styles.modalLabel}>Humidity (%):</Text>
            <TextInput
              style={styles.modalInput}
              value={editedHumidity}
              onChangeText={setEditedHumidity}
              placeholder="Enter humidity"
              keyboardType="numeric"
            />

            <Text style={styles.modalLabel}>Health Status:</Text>
            <TextInput
              style={styles.modalInput}
              value={editedHealth}
              onChangeText={setEditedHealth}
              placeholder="Enter health status"
            />

            <Text style={styles.modalLabel}>Food Offered:</Text>
            <TextInput
              style={styles.modalInput}
              value={editedFoodOffered}
              onChangeText={setEditedFoodOffered}
              placeholder="Enter food offered quantity"
              keyboardType="numeric"
            />

            <Text style={styles.modalLabel}>Food Taken:</Text>
            <TextInput
              style={styles.modalInput}
              value={editedFoodTaken}
              onChangeText={setEditedFoodTaken}
              placeholder="Enter food taken"
            />

            <Text style={styles.modalLabel}>Observations:</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={editedObservation}
              onChangeText={setEditedObservation}
              multiline
              numberOfLines={4}
              placeholder="Enter observations"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ... copy styles from primates/records.tsx ...
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    backgroundColor: "#ecf0f1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  reptileSection: {
    marginBottom: 15,
    marginLeft: 10,
  },
  reptileHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 8,
  },
  recordCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  details: {
    fontSize: 14,
    color: "#2c3e50",
    marginBottom: 5,
  },
  observation: {
    fontSize: 14,
    color: "#2c3e50",
    marginTop: 10,
    fontStyle: "italic",
  },
  label: {
    fontWeight: "bold",
  },
  checkboxGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
  },
  tag: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: 5,
    borderRadius: 5,
    fontSize: 12,
  },
  editButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  saveButton: {
    backgroundColor: "#3498db",
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  enclosureText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
    marginLeft: 2,
  },
  editedTimestamp: {
    fontSize: 12,
    color: "#95a5a6",
    fontStyle: "italic",
    marginTop: 5,
    textAlign: "right",
  },
}); 