import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { ref, push, serverTimestamp, onValue, off } from 'firebase/database';
import { database } from '../../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface Reptile {
  id: string;
  name: string;
  species: string;
  enclosure: string;
  section: string;
}

type OfflineRecord = {
  timestamp: string;
  date: string;
  animalName: string;
  species: string;
  enclosure: string;
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
};

export default function ReptileRoomForm() {
  const [reptiles, setReptiles] = useState<Reptile[]>([]);
  const [selectedReptile, setSelectedReptile] = useState<Reptile | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recordedReptiles, setRecordedReptiles] = useState<Set<string>>(new Set());
  const [showError, setShowError] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingData, setHasPendingData] = useState(false);

  const initialFormData = {
    date: "",
    temperature: "",
    humidity: "",
    health: "",
    foodOfferedQuantity: "",
    foodType: "",
    foodTaken: "",
    regurgitating: false,
    faeces: false,
    inBlue: false,
    shed: false,
    clean: false,
    urine: false,
    water: false,
    observation: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // Fetch reptiles from database
  useEffect(() => {
    const animalsRef = ref(database, 'animals');
    const unsubscribe = onValue(animalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reptilesList = Object.entries(data)
          .map(([id, animal]: [string, any]) => ({
            id,
            name: animal.name,
            species: animal.species,
            enclosure: animal.enclosure,
            section: animal.section,
          }))
          .filter(animal => animal.section === "Reptiles");
        
        setReptiles(reptilesList);
      }
    });

    return () => off(animalsRef);
  }, []);

  // Set current date
  useEffect(() => {
    const currentDate = new Date()
      .toLocaleDateString("en-GB")
      .split("/")
      .reverse()
      .join("-");
    setFormData(prev => ({ ...prev, date: currentDate }));
  }, []);

  // Update the check for existing records to track all reptiles with records
  useEffect(() => {
    if (!formData.date) return;

    const monitoringRef = ref(database, `Reptiles Monitoring Records/${formData.date}`);
    
    const unsubscribe = onValue(monitoringRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const recordedNames = new Set(Object.keys(data));
        setRecordedReptiles(recordedNames);
      } else {
        setRecordedReptiles(new Set());
      }
    });

    return () => off(monitoringRef);
  }, [formData.date]);

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
      const offlineData = await AsyncStorage.getItem('pendingReptileMonitoring');
      const pendingRecords = offlineData ? JSON.parse(offlineData) : [];
      setHasPendingData(pendingRecords.length > 0);
    } catch (error) {
      console.error('Error checking pending data:', error);
    }
  };

  // Add function to save locally
  const saveLocally = async (monitoringData: OfflineRecord) => {
    try {
      const existingData = await AsyncStorage.getItem('pendingReptileMonitoring');
      const pendingRecords = existingData ? JSON.parse(existingData) : [];
      pendingRecords.push(monitoringData);
      
      await AsyncStorage.setItem('pendingReptileMonitoring', JSON.stringify(pendingRecords));
      setHasPendingData(true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/staff/reptiles");
      }, 3000);
    } catch (error) {
      console.error('Error saving locally:', error);
      Alert.alert('Error', 'Failed to save data locally');
    }
  };

  // Add function to sync offline data
  const syncOfflineData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('pendingReptileMonitoring');
      if (offlineData) {
        const records: OfflineRecord[] = JSON.parse(offlineData);
        
        for (const record of records) {
          const monitoringRef = ref(
            database, 
            `Reptiles Monitoring Records/${record.date}/${record.animalName}`
          );
          await push(monitoringRef, {
            ...record,
            serverTimestamp: serverTimestamp()
          });
        }

        await AsyncStorage.removeItem('pendingReptileMonitoring');
        setHasPendingData(false);
        Alert.alert('Success', 'Offline records have been synchronized');
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      Alert.alert('Sync Error', 'Failed to sync offline data');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    const requiredFields = [
      'temperature',
      'humidity',
      'health',
    ] as const;

    const hasEmptyRequired = requiredFields.some(
      field => !formData[field as keyof typeof formData]
    );

    if (hasEmptyRequired) {
      Alert.alert("Error", "Please fill in all required fields");
      setShowError(true);
      return false;
    }

    // Validate temperature range
    const temp = parseFloat(formData.temperature);
    if (isNaN(temp) || temp < -50 || temp > 50) {
      Alert.alert("Error", "Temperature must be between -50°C and 50°C");
      return false;
    }

    // Validate humidity range
    const humidity = parseFloat(formData.humidity);
    if (isNaN(humidity) || humidity < 0 || humidity > 100) {
      Alert.alert("Error", "Humidity must be between 0% and 100%");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!selectedReptile) {
      Alert.alert("Error", "Please select a reptile");
      return;
    }

    if (recordedReptiles.has(selectedReptile.name)) {
      Alert.alert(
        "Record Exists",
        "A monitoring record already exists for this reptile today."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    const timestamp = new Date().toISOString();
    const dateKey = formData.date;
    
    const monitoringData = {
      ...formData,
      timestamp,
      animalName: selectedReptile.name,
      species: selectedReptile.species,
      enclosure: selectedReptile.enclosure,
    };

    try {
      if (!isOnline) {
        await saveLocally(monitoringData);
        return;
      }

      const monitoringRef = ref(
        database, 
        `Reptiles Monitoring Records/${dateKey}/${selectedReptile.name}`
      );

      await push(monitoringRef, {
        ...monitoringData,
        serverTimestamp: serverTimestamp()
      });
      
      setShowSuccess(true);
      setSelectedReptile(null);
      setFormData(initialFormData);
      
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/staff/reptiles");
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      await saveLocally(monitoringData);
      Alert.alert(
        "Connection Error",
        "Data has been saved locally and will sync when connection is restored."
      );
    }
  };

  const renderWarningMessage = () => {
    if (selectedReptile && recordedReptiles.has(selectedReptile.name)) {
      return (
        <View style={styles.warningMessage}>
          <Text style={styles.warningText}>
            ⚠️ A monitoring record already exists for {selectedReptile.name} today
          </Text>
        </View>
      );
    }
    return null;
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {renderConnectionStatus()}
        {showSuccess && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>✓ Monitoring record saved successfully!</Text>
          </View>
        )}
        
        <Text style={styles.title}>Reptile Monitoring Form</Text>

        <Text style={styles.sectionTitle}>Select Reptile</Text>
        <ScrollView horizontal style={styles.reptileSelector}>
          {reptiles.map((reptile) => (
            <TouchableOpacity
              key={reptile.id}
              style={[
                styles.reptileButton,
                selectedReptile?.id === reptile.id && styles.selectedReptileButton,
                recordedReptiles.has(reptile.name) && styles.recordedReptileButton
              ]}
              onPress={() => setSelectedReptile(reptile)}
            >
              <Text style={[
                styles.reptileButtonText,
                selectedReptile?.id === reptile.id && styles.selectedReptileText,
                recordedReptiles.has(reptile.name) && styles.recordedReptileText
              ]}>
                {reptile.name} ({reptile.species})
                {recordedReptiles.has(reptile.name) && " ✓"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {renderWarningMessage()}

        {selectedReptile && (
          <View style={styles.formSection}>
            <Text style={styles.subtitle}>
              {selectedReptile.name} ({selectedReptile.species}) - Enclosure {selectedReptile.enclosure}
            </Text>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              editable={false}
            />

            <Text style={styles.inputLabel}>Temperature °C <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[
                styles.input,
                showError && !formData.temperature && styles.errorInput
              ]}
              placeholder="Enter Temperature"
              value={formData.temperature}
              onChangeText={(text) => handleInputChange("temperature", text)}
              keyboardType="numeric"
              editable={!recordedReptiles.has(selectedReptile.name)}
            />

            <Text style={styles.inputLabel}>Humidity % <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[
                styles.input,
                showError && !formData.humidity && styles.errorInput
              ]}
              placeholder="Enter Humidity"
              value={formData.humidity}
              onChangeText={(text) => handleInputChange("humidity", text)}
              keyboardType="numeric"
              editable={!recordedReptiles.has(selectedReptile.name)}
            />

            <Text style={styles.inputLabel}>Health</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Health Status"
              value={formData.health}
              onChangeText={(text) => handleInputChange("health", text)}
            />

            <Text style={styles.inputLabel}>Food Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter How much food was offered"
              value={formData.foodOfferedQuantity}
              onChangeText={(text) =>
                handleInputChange("foodOfferedQuantity", text)
              }
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Food Type</Text>
            <Picker
              selectedValue={formData.foodType}
              style={styles.input}
              onValueChange={(itemValue) =>
                handleInputChange("foodType", itemValue)
              }
            >
              <Picker.Item label="Chicks" value="chicks" />
              <Picker.Item label="Rats" value="rats" />
            </Picker>

            <Text style={styles.inputLabel}>Food Taken</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: formData.foodOfferedQuantity
                    ? "#fff"
                    : "#f0f0f0",
                },
              ]}
              placeholder="Enter Food Taken"
              value={formData.foodTaken}
              onChangeText={(text) => handleInputChange("foodTaken", text)}
              editable={!!formData.foodOfferedQuantity}
            />
            <BouncyCheckbox
              isChecked={formData.regurgitating}
              onPress={(isChecked: boolean) =>
                handleInputChange("regurgitating", isChecked)
              }
              fillColor="green"
              text="Regurgitating"
              iconStyle={{ borderColor: "green" }}
              innerIconStyle={{ borderWidth: 2 }}
            />

            <BouncyCheckbox
              isChecked={formData.faeces}
              onPress={(isChecked: boolean) =>
                handleInputChange("faeces", isChecked)
              }
              fillColor="green"
              text="Faeces"
              iconStyle={{ borderColor: "green" }}
              innerIconStyle={{ borderWidth: 2 }}
            />

            <BouncyCheckbox
              isChecked={formData.inBlue}
              onPress={(isChecked: boolean) =>
                handleInputChange("inBlue", isChecked)
              }
              fillColor="green"
              text="In Blue"
              iconStyle={{ borderColor: "green" }}
              innerIconStyle={{ borderWidth: 2 }}
            />

            <BouncyCheckbox
              isChecked={formData.shed}
              onPress={(isChecked: boolean) =>
                handleInputChange("shed", isChecked)
              }
              fillColor="green"
              text="Shedding"
              iconStyle={{ borderColor: "green" }}
              innerIconStyle={{ borderWidth: 2 }}
            />

            <BouncyCheckbox
              isChecked={formData.clean}
              onPress={(isChecked: boolean) =>
                handleInputChange("clean", isChecked)
              }
              fillColor="green"
              text="Clean"
              iconStyle={{ borderColor: "green" }}
              innerIconStyle={{ borderWidth: 2 }}
            />

            <BouncyCheckbox
              isChecked={formData.urine}
              onPress={(isChecked: boolean) =>
                handleInputChange("urine", isChecked)
              }
              fillColor="green"
              text="Urine"
              iconStyle={{ borderColor: "green" }}
              innerIconStyle={{ borderWidth: 2 }}
            />

            <BouncyCheckbox
              isChecked={formData.water}
              onPress={(isChecked: boolean) =>
                handleInputChange("water", isChecked)
              }
              fillColor="green"
              text="Water"
              iconStyle={{ borderColor: "green" }}
              innerIconStyle={{ borderWidth: 2 }}
            />

            <Text style={styles.inputLabel}>Observations / Life Support</Text>
            <TextInput
              style={styles.largeInput}
              placeholder="Enter Observations"
              value={formData.observation}
              onChangeText={(text) => handleInputChange("observation", text)}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.submitButton,
                recordedReptiles.has(selectedReptile.name) && styles.disabledButton
              ]} 
              onPress={handleSubmit}
              disabled={recordedReptiles.has(selectedReptile.name)}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  formSection: {
    backgroundColor: "white",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: "grey",
    marginTop: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  largeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: "#fff",
    height: 100,
    textAlignVertical: "top",
  },
  required: {
    color: '#e74c3c',
    fontSize: 16,
  },
  errorInput: {
    borderColor: '#e74c3c',
    borderWidth: 1,
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
  submitButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#b0bec5',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#2c3e50",
  },
  reptileSelector: {
    flexDirection: "row",
    marginBottom: 20,
  },
  reptileButton: {
    backgroundColor: "#ecf0f1",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  selectedReptileButton: {
    backgroundColor: "#3498db",
    borderColor: "#2980b9",
  },
  reptileButtonText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  selectedReptileText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  recordedReptileButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#81c784',
  },
  recordedReptileText: {
    color: '#2e7d32',
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
