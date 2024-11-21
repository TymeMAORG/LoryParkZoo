import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { ref, get, set, onValue, off } from "firebase/database";
import { database } from "../../../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

type Bird = {
  id: string;
  name: string;
  species: string;
  section: string;
};

type FoodIntakeState = {
  [birdName: string]: string;
};

type OfflineRecord = {
  timestamp: string;
  date: string;
  foodIntake: FoodIntakeState;
};

type DailyReport = {
  timestamp: string;
  date: string;
  foodIntake: FoodIntakeState;
};

const foodOptions = ["All", "3/4", "1/2", "1/4", "None"];

export default function FoodMonitoringSheet() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [foodIntake, setFoodIntake] = useState<FoodIntakeState>({});
  const [currentDate, setCurrentDate] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFoodIntakeError, setShowFoodIntakeError] = useState(false);
  const [existingRecord, setExistingRecord] = useState(false);
  const [recordedBirds, setRecordedBirds] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingData, setHasPendingData] = useState(false);

  useEffect(() => {
    const animalsRef = ref(database, "animals");
    const unsubscribe = onValue(animalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const filteredBirds = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((bird) => bird.section === "BirdsOfPrey");
        
        if (filteredBirds.length === 0) {
          console.log("No birds of prey found in database");
        } else {
          console.log(`Found ${filteredBirds.length} birds of prey`);
        }
        
        setBirds(filteredBirds);
      } else {
        console.log("No animals found in the database.");
        setBirds([]);
      }
    }, (error) => {
      console.error("Error fetching birds:", error);
      Alert.alert(
        "Error",
        "Failed to load birds. Please check your connection and try again."
      );
    });

    return () => off(animalsRef);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const foodMonitoringRef = ref(database, `BirdsOfPrey FoodMonitoring Sheet/${today}`);
    
    const unsubscribe = onValue(foodMonitoringRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const recordedBirdsSet = new Set(Object.keys(data.foodIntake || {}));
        setRecordedBirds(recordedBirdsSet);
        setFoodIntake(data.foodIntake || {});
        setExistingRecord(recordedBirdsSet.size === birds.length);
      } else {
        setExistingRecord(false);
        setFoodIntake({});
        setRecordedBirds(new Set());
      }
    });

    return () => off(foodMonitoringRef);
  }, [birds.length]);

  useEffect(() => {
    const today = new Date();
    const dateStr = today.toDateString();
    const timeStr = today.toLocaleTimeString();
    setCurrentDate(`${dateStr} - ${timeStr}`);
  }, []);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const testRef = ref(database, 'connectionTest');
        await set(testRef, {
          lastChecked: new Date().toISOString(),
          status: 'connected'
        });
        
        const snapshot = await get(testRef);
        if (snapshot.exists()) {
          console.log('Firebase connection working properly:', snapshot.val());
        } else {
          console.log('Firebase connected but unable to read/write data');
        }
      } catch (error) {
        console.error('Firebase connection error:', error);
      }
    };
    
    testConnection();
  }, []);

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

  useEffect(() => {
    checkPendingData();
  }, []);

  const checkPendingData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('pendingBirdFoodMonitoring');
      setHasPendingData(!!offlineData);
    } catch (error) {
      console.error('Error checking pending data:', error);
    }
  };

  const saveLocally = async (monitoringData: OfflineRecord) => {
    try {
      await AsyncStorage.setItem('pendingBirdFoodMonitoring', JSON.stringify(monitoringData));
      setHasPendingData(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving locally:', error);
      Alert.alert('Error', 'Failed to save data locally');
    }
  };

  const syncOfflineData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('pendingBirdFoodMonitoring');
      if (offlineData) {
        const data: OfflineRecord = JSON.parse(offlineData);
        const foodMonitoringRef = ref(database, `BirdsOfPrey FoodMonitoring Sheet/${data.date}`);
        
        await set(foodMonitoringRef, data);
        
        await AsyncStorage.removeItem('pendingBirdFoodMonitoring');
        setHasPendingData(false);
        Alert.alert('Success', 'Offline data has been synchronized');
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      Alert.alert('Sync Error', 'Failed to sync offline data');
    }
  };

  const handleSelection = (birdName: string, option: string) => {
    if (recordedBirds.has(birdName)) return;
    
    setFoodIntake((prev) => ({ ...prev, [birdName]: option }));
    setShowFoodIntakeError(false);
  };

  const saveDataToFirebase = async () => {
    if (existingRecord) {
      Alert.alert(
        "Record Exists",
        "A food monitoring record already exists for today. Please wait for the next day to submit a new record."
      );
      return;
    }

    const missingFoodIntake = birds.some(bird => !foodIntake[bird.name]);
    if (missingFoodIntake) {
      setShowFoodIntakeError(true);
      Alert.alert(
        "Required Field", 
        "Please record food intake for all birds"
      );
      return;
    }

    const dateKey = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    const monitoringData = {
      timestamp,
      date: dateKey,
      foodIntake
    };

    if (!isOnline) {
      await saveLocally(monitoringData);
      return;
    }

    try {
      const foodMonitoringRef = ref(database, `BirdsOfPrey FoodMonitoring Sheet/${dateKey}`);
      await set(foodMonitoringRef, monitoringData);

      setFoodIntake({});
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      await saveLocally(monitoringData);
      Alert.alert(
        "Connection Error", 
        "Data has been saved locally and will sync when connection is restored."
      );
    }
  };

  const renderWarningMessage = () => {
    if (existingRecord) {
      return (
        <View style={styles.warningMessage}>
          <Text style={styles.warningText}>
            ⚠️ A food monitoring record already exists for today
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderBirdFoodOptions = (bird: Bird) => {
    const isRecorded = recordedBirds.has(bird.name);
    
    return (
      <View key={bird.id} style={[
        styles.row,
        showFoodIntakeError && !foodIntake[bird.name] && !isRecorded && styles.errorRow,
        isRecorded && styles.recordedRow
      ]}>
        <Text style={[styles.cell, styles.birdCell]}>
          {bird.name} / {bird.species}
          {isRecorded && <Text style={styles.recordedBadge}> (Recorded)</Text>}
        </Text>
        <View style={styles.foodOptions}>
          {foodOptions.map((option, optionIndex) => (
            <TouchableOpacity
              key={optionIndex}
              style={[
                styles.optionButton,
                foodIntake[bird.name] === option && styles.selectedButton,
                showFoodIntakeError && !foodIntake[bird.name] && !isRecorded && styles.errorButton,
                isRecorded && styles.disabledButton,
                isRecorded && foodIntake[bird.name] === option && styles.recordedSelectedButton
              ]}
              onPress={() => handleSelection(bird.name, option)}
              disabled={isRecorded}
            >
              <Text
                style={[
                  styles.optionText,
                  foodIntake[bird.name] === option && styles.selectedText,
                  isRecorded && styles.disabledText,
                  isRecorded && foodIntake[bird.name] === option && styles.recordedSelectedText
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

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

  if (birds.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.messageText}>No birds of prey found. Please add birds first.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {renderConnectionStatus()}
      {showSuccess && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>✓ Data saved successfully!</Text>
        </View>
      )}
      {renderWarningMessage()}
      <View style={styles.header}>
        <Text style={styles.headerText}>Daily Food Monitoring Sheet</Text>
        <Text style={styles.dateText}>Date: {currentDate}</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.headerCell]}>Name / Species</Text>
          <Text style={[styles.cell, styles.headerCell]}>
            Leftover Food <Text style={styles.required}>*</Text>
          </Text>
        </View>
        {birds.map(renderBirdFoodOptions)}
        
        {showFoodIntakeError && (
          <Text style={styles.errorText}>
            Please select leftover food for all unrecorded birds
          </Text>
        )}

        <TouchableOpacity 
          style={[
            styles.button, 
            styles.saveButton,
            existingRecord && styles.disabledSaveButton
          ]} 
          onPress={saveDataToFirebase}
          disabled={existingRecord}
        >
          <Text style={[
            styles.buttonText,
            existingRecord && styles.disabledButtonText
          ]}>
            Save
          </Text>
        </TouchableOpacity>
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
    backgroundColor: "#3498db",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedText: {
    color: "#fff",
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#3498db",
    alignSelf: "center",
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  required: {
    color: '#e74c3c',
    fontSize: 16,
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
  errorRow: {
    backgroundColor: '#ffebee',
  },
  errorButton: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  disabledSaveButton: {
    backgroundColor: '#b0bec5',
  },
  disabledText: {
    color: '#999',
  },
  disabledButtonText: {
    color: '#fff',
  },
  recordedRow: {
    backgroundColor: '#f8f9fa',
  },
  recordedBadge: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  recordedSelectedButton: {
    backgroundColor: '#3498db44',
    borderColor: '#3498db',
  },
  recordedSelectedText: {
    color: '#3498db',
    fontWeight: 'bold',
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