import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ref, get, set, onValue, off } from "firebase/database";
import { database } from "../../../firebaseConfig";
import { Ionicons } from '@expo/vector-icons';

type BigCat = {
  id: string;
  name: string;
  species: string;
  section: string;
};

type FoodIntakeState = {
  [catName: string]: string;
};

// Add new types for offline data
type OfflineRecord = {
  timestamp: string;
  date: string;
  temperature: number;
  foodIntake: FoodIntakeState;
};

type DailyReport = {
  timestamp: string;
  date: string;
  temperature: number;
  foodIntake: FoodIntakeState;
};

const foodOptions = ["All", "3/4", "1/2", "1/4", "None"];

export default function FoodMonitoringSheet() {
  const [bigCats, setBigCats] = useState<BigCat[]>([]);
  const [foodIntake, setFoodIntake] = useState<FoodIntakeState>({});
  const [currentDate, setCurrentDate] = useState<string>("");
  const [temperature, setTemperature] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFoodIntakeError, setShowFoodIntakeError] = useState(false);
  const [existingRecord, setExistingRecord] = useState(false);
  const [recordedCats, setRecordedCats] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingData, setHasPendingData] = useState(false);

  // Replace the fetchBigCats useEffect with real-time listener
  useEffect(() => {
    const animalsRef = ref(database, "animals");
    const unsubscribe = onValue(animalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const filteredCats = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((cat) => cat.section === "BigCats");
        
        if (filteredCats.length === 0) {
          console.log("No big cats found in database");
        } else {
          console.log(`Found ${filteredCats.length} big cats`);
        }
        
        setBigCats(filteredCats);
      } else {
        console.log("No animals found in the database.");
        setBigCats([]);
      }
    }, (error) => {
      console.error("Error fetching big cats:", error);
      Alert.alert(
        "Error",
        "Failed to load big cats. Please check your connection and try again."
      );
    });

    // Cleanup subscription on unmount
    return () => off(animalsRef);
  }, []);

  // Modify the real-time updates for existing food monitoring data
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const foodMonitoringRef = ref(database, `BigCats FoodMonitoring Sheet/${today}`);
    
    const unsubscribe = onValue(foodMonitoringRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTemperature(data.temperature.toString());
        
        // Get the names of cats that have records
        const recordedCatsSet = new Set(Object.keys(data.foodIntake || {}));
        setRecordedCats(recordedCatsSet);
        
        // Only set food intake for recorded cats
        setFoodIntake(data.foodIntake || {});
        
        // Set existingRecord only if ALL cats have been recorded
        setExistingRecord(recordedCatsSet.size === bigCats.length);
      } else {
        setExistingRecord(false);
        setTemperature("");
        setFoodIntake({});
        setRecordedCats(new Set());
      }
    });

    return () => off(foodMonitoringRef);
  }, [bigCats.length]);

  // Set the current date and time
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toDateString();
    const timeStr = today.toLocaleTimeString();
    setCurrentDate(`${dateStr} - ${timeStr}`);
  }, []);

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

  // Check for pending offline data on mount
  useEffect(() => {
    checkPendingData();
  }, []);

  const checkPendingData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('pendingFoodMonitoring');
      setHasPendingData(!!offlineData);
    } catch (error) {
      console.error('Error checking pending data:', error);
    }
  };

  // Add function to save data locally
  const saveLocally = async (monitoringData: OfflineRecord) => {
    try {
      await AsyncStorage.setItem('pendingFoodMonitoring', JSON.stringify(monitoringData));
      setHasPendingData(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving locally:', error);
      Alert.alert('Error', 'Failed to save data locally');
    }
  };

  // Add function to sync offline data
  const syncOfflineData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('pendingFoodMonitoring');
      if (offlineData) {
        const data: OfflineRecord = JSON.parse(offlineData);
        const foodMonitoringRef = ref(database, `BigCats FoodMonitoring Sheet/${data.date}`);
        const temperatureHistoryRef = ref(database, `BigCats Temperature History/${data.date}`);

        await set(foodMonitoringRef, data);
        await set(temperatureHistoryRef, {
          temperature: data.temperature,
          timestamp: data.timestamp
        });

        // Clear offline data after successful sync
        await AsyncStorage.removeItem('pendingFoodMonitoring');
        setHasPendingData(false);
        Alert.alert('Success', 'Offline data has been synchronized');
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      Alert.alert('Sync Error', 'Failed to sync offline data');
    }
  };

  // Handle selection of food intake for each cat
  const handleSelection = (catName: string, option: string) => {
    if (recordedCats.has(catName)) return; // Prevent selection if cat is already recorded
    
    setFoodIntake((prev) => ({ ...prev, [catName]: option }));
    setShowFoodIntakeError(false);
  };

  // Add temperature validation
  const validateTemperature = (temp: string): boolean => {
    if (!temp || temp.trim() === '') {
      return false;
    }
    const tempNum = parseFloat(temp);
    return !isNaN(tempNum) && tempNum >= -50 && tempNum <= 50;
  };

  // Modify saveDataToFirebase to handle offline/online scenarios
  const saveDataToFirebase = async () => {
    if (existingRecord) {
      Alert.alert(
        "Record Exists",
        "A food monitoring record already exists for today. Please wait for the next day to submit a new record."
      );
      return;
    }

    // Check for empty temperature first
    if (!temperature || temperature.trim() === '') {
      Alert.alert(
        "Required Field", 
        "Temperature reading is required. Please enter a temperature value."
      );
      return;
    }

    // Then validate temperature range
    if (!validateTemperature(temperature)) {
      Alert.alert(
        "Invalid Temperature", 
        "Please enter a valid temperature between -50°C and 50°C"
      );
      return;
    }

    // Check if all cats have food intake recorded
    const missingFoodIntake = bigCats.some(cat => !foodIntake[cat.name]);
    if (missingFoodIntake) {
      setShowFoodIntakeError(true);
      Alert.alert(
        "Required Field", 
        "Please record food intake for all animals"
      );
      return;
    }

    const dateKey = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    const monitoringData = {
      timestamp,
      date: dateKey,
      temperature: parseFloat(temperature),
      foodIntake
    };

    if (!isOnline) {
      await saveLocally(monitoringData);
      return;
    }

    try {
      const foodMonitoringRef = ref(database, `BigCats FoodMonitoring Sheet/${dateKey}`);
      const temperatureHistoryRef = ref(database, `BigCats Temperature History/${dateKey}`);

      await set(foodMonitoringRef, monitoringData);
      await set(temperatureHistoryRef, {
        temperature: parseFloat(temperature),
        timestamp
      });

      setFoodIntake({});
      setTemperature("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      // If online save fails, save locally
      await saveLocally(monitoringData);
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
            ⚠️ A food monitoring record already exists for today
          </Text>
        </View>
      );
    }
    return null;
  };

  // Modify the render of each cat's food options
  const renderCatFoodOptions = (cat: BigCat) => {
    const isRecorded = recordedCats.has(cat.name);
    
    return (
      <View key={cat.id} style={[
        styles.row,
        showFoodIntakeError && !foodIntake[cat.name] && !isRecorded && styles.errorRow,
        isRecorded && styles.recordedRow
      ]}>
        <View style={styles.catInfoContainer}>
          <Text style={[styles.cell, styles.catCell]} numberOfLines={2}>
            {cat.name} / {cat.species}
            {isRecorded && <Text style={styles.recordedBadge}> (Recorded)</Text>}
          </Text>
        </View>
        <View style={styles.foodOptionsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.foodOptions}
          >
            {foodOptions.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={[
                  styles.optionButton,
                  foodIntake[cat.name] === option && styles.selectedButton,
                  showFoodIntakeError && !foodIntake[cat.name] && !isRecorded && styles.errorButton,
                  isRecorded && styles.disabledButton,
                  isRecorded && foodIntake[cat.name] === option && styles.recordedSelectedButton
                ]}
                onPress={() => handleSelection(cat.name, option)}
                disabled={isRecorded}
              >
                <Text
                  style={[
                    styles.optionText,
                    foodIntake[cat.name] === option && styles.selectedText,
                    isRecorded && styles.disabledText,
                    isRecorded && foodIntake[cat.name] === option && styles.recordedSelectedText
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
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

  // Add a loading state when no big cats are found
  if (bigCats.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.messageText}>No big cats found. Please add big cats first.</Text>
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
      <View style={styles.temperatureContainer}>
        <Text style={styles.subtitle}>Enter Temperature (°C): <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[
            styles.input,
            !temperature && styles.requiredInput,
            existingRecord && styles.disabledInput
          ]}
          keyboardType="numeric"
          placeholder="e.g. 25"
          value={temperature}
          onChangeText={setTemperature}
          editable={!existingRecord}
        />
      </View>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.headerCell]}>Name / Species</Text>
          <Text style={[styles.cell, styles.headerCell]}>
            Leftover Food <Text style={styles.required}>*</Text>
          </Text>
        </View>
        {bigCats.map(renderCatFoodOptions)}
        
        {showFoodIntakeError && (
          <Text style={styles.errorText}>
            Please select leftover food for all unrecorded animals
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
    paddingVertical: 10,
    paddingHorizontal: 8,
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
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flexWrap: 'wrap',
  },
  foodOptionsContainer: {
    flex: 0.6, // Takes 60% of the row width
  },
  foodOptions: {
    flexDirection: "row",
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  optionButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedButton: {
    backgroundColor: "#3498db",
    borderColor: "#2980b9",
  },
  optionText: {
    fontSize: 12,
    color: "#333",
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedText: {
    color: "#fff", // Selected text color
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#3498db", // Changed to match the add button color in index
    alignSelf: "center",
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  temperatureContainer: {
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
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
  requiredInput: {
    borderColor: '#e74c3c',
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
    backgroundColor: '#3498db44', // Semi-transparent version of the selected color
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
  catInfoContainer: {
    flex: 0.4, // Takes 40% of the row width
    justifyContent: 'center',
  },
});
