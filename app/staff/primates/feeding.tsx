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
import { ref, get, push, set, child, onValue, off } from "firebase/database";
import { database } from "../../../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface Primate {
  id: string;
  name: string;
  species: string;
  section: string;
  status: string;
}

type HealthStatus = 'Healthy' | 'Unhealthy/Ill' | 'Convalescing';

type OfflineRecord = {
  timestamp: string;
  feedingDetails: string;
  healthStatus: HealthStatus;
  observations: string;
  primateName: string;
};

export default function PrimateFeedingForm() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [primates, setPrimates] = useState<Primate[]>([]);
  const [selectedPrimate, setSelectedPrimate] = useState<string>("");
  const [feedingDetails, setFeedingDetails] = useState<string>("");
  const [observations, setObservations] = useState<string>("");
  const [healthStatus, setHealthStatus] = useState<HealthStatus | ''>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingRecord, setExistingRecord] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingData, setHasPendingData] = useState(false);

  useEffect(() => {
    // Set up real-time listener for primates
    const animalsRef = ref(database, 'animals');
    const unsubscribe = onValue(animalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const primatesArray = Object.entries(data)
          .map(([id, animal]: [string, any]) => ({
            id,
            name: animal.name,
            species: animal.species,
            section: animal.section,
            status: animal.status
          }))
          .filter(animal => 
            animal.section === "Primates" && 
            animal.status === "Alive"
          );
        
        setPrimates(primatesArray);
      } else {
        setPrimates([]);
      }
    });

    // Set current date
    const today = new Date();
    setCurrentDate(today.toDateString());

    return () => off(animalsRef);
  }, []);

  // Add check for existing records
  useEffect(() => {
    if (!selectedPrimate) return;

    const today = new Date().toISOString().split('T')[0];
    const feedingRef = ref(database, `Primates Feeding Records/${today}/${selectedPrimate}`);
    
    const unsubscribe = onValue(feedingRef, (snapshot) => {
      if (snapshot.exists()) {
        setExistingRecord(true);
      } else {
        setExistingRecord(false);
      }
    });

    return () => off(feedingRef);
  }, [selectedPrimate]);

  // Add network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(!!online);
      
      if (online) {
        syncOfflineData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Check for pending offline data
  useEffect(() => {
    checkPendingData();
  }, []);

  const checkPendingData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('pendingPrimateFeeding');
      setHasPendingData(!!offlineData);
    } catch (error) {
      console.error('Error checking pending data:', error);
    }
  };

  // Add function to save locally
  const saveLocally = async (feedingRecord: OfflineRecord) => {
    try {
      const existingData = await AsyncStorage.getItem('pendingPrimateFeeding');
      const pendingRecords = existingData ? JSON.parse(existingData) : [];
      pendingRecords.push(feedingRecord);
      
      await AsyncStorage.setItem('pendingPrimateFeeding', JSON.stringify(pendingRecords));
      setHasPendingData(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      clearForm();
    } catch (error) {
      console.error('Error saving locally:', error);
      Alert.alert('Error', 'Failed to save data locally');
    }
  };

  // Add function to sync offline data
  const syncOfflineData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('pendingPrimateFeeding');
      if (offlineData) {
        const records: OfflineRecord[] = JSON.parse(offlineData);
        
        for (const record of records) {
          const dateKey = record.timestamp.split('T')[0];
          const feedingRef = ref(database, `Primates Feeding Records/${dateKey}/${record.primateName}`);
          const newFeedingRef = push(feedingRef);
          await set(newFeedingRef, record);
        }

        await AsyncStorage.removeItem('pendingPrimateFeeding');
        setHasPendingData(false);
        Alert.alert('Success', 'Offline records have been synchronized');
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      Alert.alert('Sync Error', 'Failed to sync offline data');
    }
  };

  // Modify handleSave to handle offline/online scenarios
  const handleSave = async () => {
    if (existingRecord) {
      Alert.alert(
        "Record Exists",
        "A feeding record already exists for this primate today. Please wait for the next day to submit a new record."
      );
      return;
    }

    if (!selectedPrimate || !feedingDetails || !healthStatus) {
      Alert.alert("Error", "Please select a primate, enter feeding details, and select health status.");
      return;
    }

    const feedingRecord = {
      timestamp: new Date().toISOString(),
      feedingDetails,
      healthStatus,
      observations: observations.trim() || "",
      primateName: selectedPrimate
    };

    if (!isOnline) {
      await saveLocally(feedingRecord);
      return;
    }

    try {
      const dateKey = feedingRecord.timestamp.split('T')[0];
      const feedingRef = ref(database, `Primates Feeding Records/${dateKey}/${selectedPrimate}`);
      const newFeedingRef = push(feedingRef);
      
      await set(newFeedingRef, feedingRecord);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      clearForm();
    } catch (error) {
      console.error("Error saving feeding data:", error);
      await saveLocally(feedingRecord);
      Alert.alert(
        "Connection Error", 
        "Data has been saved locally and will sync when connection is restored."
      );
    }
  };

  // Add warning message when record exists
  const renderWarningMessage = () => {
    if (existingRecord) {
      return (
        <View style={styles.warningMessage}>
          <Text style={styles.warningText}>
            ⚠️ A feeding record already exists for this primate today
          </Text>
        </View>
      );
    }
    return null;
  };

  const clearForm = () => {
    setSelectedPrimate("");
    setFeedingDetails("");
    setHealthStatus("");
    setObservations("");
  };

  // Add connection status indicator
  const renderConnectionStatus = () => (
    <View style={[
      styles.connectionStatus,
      isOnline ? styles.onlineStatus : styles.offlineStatus
    ]}>
      <View style={[
        styles.connectionDot,
        isOnline ? styles.onlineDot : styles.offlineDot
      ]} />
      <Text style={styles.connectionStatusText}>
        {isOnline ? 'Online' : 'Offline'}
        {!isOnline && hasPendingData && ' • Pending Sync'}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderConnectionStatus()}
      {showSuccess && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>✓ Feeding record saved successfully!</Text>
        </View>
      )}
      {renderWarningMessage()}
      
      <Text style={styles.title}>Primate Feeding Form</Text>
      <Text style={styles.label}>Date: {currentDate}</Text>

      <Text style={styles.label}>Select Primate</Text>
      <ScrollView horizontal style={styles.primatePicker}>
        {primates.map((primate: Primate) => (
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
              {primate.name} ({primate.species})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Feeding Details <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter feeding details (e.g., food type, quantity, time)"
        value={feedingDetails}
        onChangeText={(text) => {
          if (text.length <= 500) {  // Maximum 500 characters
            setFeedingDetails(text);
          }
        }}
        multiline
        numberOfLines={4}
        maxLength={500}  // Enforce maximum length
      />
      <Text style={styles.characterCount}>
        {feedingDetails.length}/500 characters
      </Text>

      <Text style={styles.label}>Health Status <Text style={styles.required}>*</Text></Text>
      <View style={styles.healthPicker}>
        {(['Healthy', 'Unhealthy/Ill', 'Convalescing'] as HealthStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.healthButton,
              status === 'Healthy' && styles.healthyButton,
              status === 'Unhealthy/Ill' && styles.unhealthyButton,
              status === 'Convalescing' && styles.convalescingButton,
              healthStatus === status && styles.selectedHealthButton,
              healthStatus === status && status === 'Healthy' && styles.healthyButtonSelected,
              healthStatus === status && status === 'Unhealthy/Ill' && styles.unhealthyButtonSelected,
              healthStatus === status && status === 'Convalescing' && styles.convalescingButtonSelected,
            ]}
            onPress={() => setHealthStatus(status)}
          >
            <Text
              style={[
                styles.healthButtonText,
                healthStatus === status && styles.selectedHealthButtonText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Observations (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter any observations or notes"
        value={observations}
        onChangeText={(text) => {
          if (text.length <= 1000) {  // Maximum 1000 characters
            setObservations(text);
          }
        }}
        multiline
        numberOfLines={4}
        maxLength={1000}  // Enforce maximum length
      />
      <Text style={styles.characterCount}>
        {observations.length}/1000 characters
      </Text>

      <TouchableOpacity 
        style={[
          styles.saveButton,
          existingRecord && styles.disabledSaveButton
        ]} 
        onPress={handleSave}
        disabled={existingRecord}
      >
        <Text style={styles.buttonText}>Save Feeding Record</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9", 
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
  textArea: {
    height: 100,
    verticalAlign: 'top',
    paddingTop: 10,
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
  required: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 15,
  },
  successMessage: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  successText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningMessage: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  warningText: {
    color: '#856404',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  disabledSaveButton: {
    backgroundColor: '#b0bec5',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineStatus: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  offlineStatus: {
    borderColor: '#FF5252',
    borderWidth: 1,
  },
  onlineDot: {
    backgroundColor: '#4CAF50',
  },
  offlineDot: {
    backgroundColor: '#FF5252',
  },
  connectionStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
});
