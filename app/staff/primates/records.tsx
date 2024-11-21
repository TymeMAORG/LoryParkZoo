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

type FeedingRecord = {
  timestamp: string;
  feedingDetails: string;
  healthStatus: 'Healthy' | 'Unhealthy/Ill' | 'Convalescing';
  observations: string;
};

type GroupedRecords = {
  [date: string]: {
    [primate: string]: {
      [key: string]: FeedingRecord;
    };
  };
};

export default function FeedingRecords() {
  const [records, setRecords] = useState<GroupedRecords>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{
    date: string;
    primate: string;
    recordKey: string;
    record: FeedingRecord;
  } | null>(null);
  const [editedFeedingDetails, setEditedFeedingDetails] = useState("");
  const [editedHealthStatus, setEditedHealthStatus] = useState<FeedingRecord['healthStatus']>('Healthy');
  const [editedObservations, setEditedObservations] = useState("");

  useEffect(() => {
    console.log('Setting up real-time listener for feeding records');
    const recordsRef = ref(database, "Primates Feeding Records");
    
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Received feeding records update:', {
          numberOfDates: Object.keys(data).length,
          dates: Object.keys(data)
        });
        setRecords(data);
      } else {
        console.log('No feeding records found');
        setRecords({});
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching feeding records:", error);
      Alert.alert("Error", "Failed to load feeding records");
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up feeding records listener');
      unsubscribe();
    };
  }, []);

  const handleEdit = (date: string, primate: string, recordKey: string, record: FeedingRecord) => {
    console.log('Editing record:', {
      date,
      primate,
      recordKey,
      record
    });
    setEditingRecord({ date, primate, recordKey, record });
    setEditedFeedingDetails(record.feedingDetails);
    setEditedHealthStatus(record.healthStatus);
    setEditedObservations(record.observations || "");
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) {
      console.warn('Attempted to save edit with no active editing record');
      return;
    }

    console.log('Saving edited record:', {
      editedFeedingDetails,
      editedHealthStatus,
      editedObservations
    });

    try {
      const { date, primate, recordKey } = editingRecord;
      console.log('Updating record at path:', `Primates Feeding Records/${date}/${primate}/${recordKey}`);
      
      const recordRef = ref(
        database,
        `Primates Feeding Records/${date}/${primate}/${recordKey}`
      );

      const updatedData = {
        ...editingRecord.record,
        feedingDetails: editedFeedingDetails,
        healthStatus: editedHealthStatus,
        observations: editedObservations.trim() || "",
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
        <Text style={styles.title}>Feeding Records</Text>
        {Object.entries(records)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([date, primateRecords]) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{new Date(date).toDateString()}</Text>
              {Object.entries(primateRecords).map(([primate, feedingRecords]) => (
                <View key={primate} style={styles.primateSection}>
                  <Text style={styles.primateHeader}>{primate}</Text>
                  {Object.entries(feedingRecords).map(([recordKey, record]) => (
                    <View key={recordKey} style={styles.recordCard}>
                      <View style={styles.recordHeader}>
                        <Text style={styles.timestamp}>
                          <Text style={styles.label}>Time Recorded: </Text>
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleEdit(date, primate, recordKey, record)}
                          style={styles.editButton}
                        >
                          <Ionicons name="pencil" size={20} color="#3498db" />
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={styles.details}>
                        <Text style={styles.label}>Feeding Details: </Text>
                        {record.feedingDetails}
                      </Text>

                      <Text style={[
                        styles.healthStatus,
                        record.healthStatus === 'Healthy' && styles.healthyStatus,
                        record.healthStatus === 'Unhealthy/Ill' && styles.unhealthyStatus,
                        record.healthStatus === 'Convalescing' && styles.convalescingStatus,
                      ]}>
                        <Text style={styles.label}>Health Status: </Text>
                        {record.healthStatus}
                      </Text>

                      {record.observations && (
                        <Text style={styles.details}>
                          <Text style={styles.label}>Observations: </Text>
                          {record.observations}
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
            
            <Text style={styles.modalLabel}>Feeding Details:</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={editedFeedingDetails}
              onChangeText={setEditedFeedingDetails}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.modalLabel}>Health Status:</Text>
            <View style={styles.healthPicker}>
              {(['Healthy', 'Unhealthy/Ill', 'Convalescing'] as FeedingRecord['healthStatus'][]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.healthButton,
                    status === 'Healthy' && styles.healthyButton,
                    status === 'Unhealthy/Ill' && styles.unhealthyButton,
                    status === 'Convalescing' && styles.convalescingButton,
                    editedHealthStatus === status && styles.selectedHealthButton,
                    editedHealthStatus === status && status === 'Healthy' && styles.healthyButtonSelected,
                    editedHealthStatus === status && status === 'Unhealthy/Ill' && styles.unhealthyButtonSelected,
                    editedHealthStatus === status && status === 'Convalescing' && styles.convalescingButtonSelected,
                  ]}
                  onPress={() => setEditedHealthStatus(status)}
                >
                  <Text
                    style={[
                      styles.healthButtonText,
                      editedHealthStatus === status && styles.selectedHealthButtonText,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Observations (Optional):</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={editedObservations}
              onChangeText={setEditedObservations}
              multiline
              numberOfLines={4}
              placeholder="Enter any observations"
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
  primateSection: {
    marginBottom: 15,
    marginLeft: 10,
  },
  primateHeader: {
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
  timestamp: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: "#2c3e50",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  editButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  healthStatus: {
    fontSize: 14,
    marginBottom: 5,
    padding: 5,
    borderRadius: 5,
  },
  healthyStatus: {
    backgroundColor: '#2ecc7133',
  },
  unhealthyStatus: {
    backgroundColor: '#e74c3c33',
  },
  convalescingStatus: {
    backgroundColor: '#f1c40f33',
  },
  healthPicker: {
    flexDirection: "column",
    marginBottom: 20,
    gap: 10,
  },
  healthButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  selectedHealthButton: {
    borderWidth: 0,
  },
  healthyButton: {
    borderColor: "#2ecc71",
    backgroundColor: "#ffffff",
  },
  healthyButtonSelected: {
    backgroundColor: "#2ecc71",
  },
  unhealthyButton: {
    borderColor: "#e74c3c",
    backgroundColor: "#ffffff",
  },
  unhealthyButtonSelected: {
    backgroundColor: "#e74c3c",
  },
  convalescingButton: {
    borderColor: "#f1c40f",
    backgroundColor: "#ffffff",
  },
  convalescingButtonSelected: {
    backgroundColor: "#f1c40f",
  },
  healthButtonText: {
    fontSize: 16,
    color: "#34495e",
  },
  selectedHealthButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
}); 