import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  FlatList,
  Modal
} from "react-native";
import { ref, push, set, get, onValue, off } from "firebase/database";
import { database } from "../../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

interface Animal {
  id: string;
  name: string;
  species: string;
  age: string;
  sex: string;
  health: string;
  status: string;
  dateAdded: string;
}

type HealthStatus = 'Healthy' | 'Unhealthy/Ill' | 'Convalescing';

export default function PrimatesHome() {
  const [name, setName] = useState("");
  const [commonName, setCommonName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('Healthy');
  const [showForm, setShowForm] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [editingPrimate, setEditingPrimate] = useState<Animal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Set up real-time listener
    const animalsRef = ref(database, 'animals');
    const unsubscribe = onValue(animalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const primatesArray = Object.entries(data)
          .map(([id, animal]: [string, any]) => ({
            id,
            ...animal
          }))
          .filter(animal => animal.section === "Primates");
        
        setAnimals(primatesArray);
      } else {
        setAnimals([]); // Reset to empty array if no data exists
      }
    }, (error) => {
      console.error("Error fetching primates:", error);
      Alert.alert("Error", "Failed to load primates");
    });

    // Cleanup function to remove listener when component unmounts
    return () => {
      off(animalsRef);
    };
  }, []); // Empty dependency array since we want this to run once on mount

  const handleSave = async () => {
    console.log('Attempting to save new primate with data:', {
      name,
      species: commonName,
      age,
      sex,
      healthStatus
    });

    if (!name.trim() || !commonName.trim() || !age || !sex || !healthStatus) {
      console.warn('Validation failed: Missing required fields');
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      console.log('Creating primate record with timestamp:', timestamp);
      
      const primateData = {
        name,
        species: commonName,
        health: healthStatus,
        section: "Primates",
        status: "Alive",
        age,
        sex,
        dateAdded: timestamp
      };

      console.log('Saving primate data:', primateData);
      const animalsRef = ref(database, 'animals');
      const newAnimalRef = push(animalsRef);
      await set(newAnimalRef, primateData);
      
      // Close modal first
      setModalVisible(false);
      clearForm();
      
      // Show success message after modal is closed
      console.log('Primate saved successfully with ID:', newAnimalRef.key);
      Alert.alert("Success", "Primate added successfully");
    } catch (error) {
      console.error("Error saving primate:", error);
      Alert.alert("Error", "Failed to save primate data");
    }
  };

  const handleEdit = (primate: Animal) => {
    setEditingPrimate(primate);
    setName(primate.name);
    setCommonName(primate.species);
    setAge(primate.age);
    setSex(primate.sex as "male" | "female");
    setHealthStatus(primate.health as HealthStatus);
    setModalVisible(true);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!editingPrimate) return;

    console.log('Attempting to update primate:', editingPrimate.id);

    if (!name.trim() || !commonName.trim() || !age || !sex || !healthStatus) {
      console.warn('Validation failed: Missing required fields');
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const updatedPrimate = {
        name,
        species: commonName,
        health: healthStatus,
        section: "Primates",
        status: editingPrimate.status,
        age,
        sex,
        dateAdded: editingPrimate.dateAdded,
        lastUpdated: timestamp
      };

      console.log('Updating primate data:', updatedPrimate);
      const primateRef = ref(database, `animals/${editingPrimate.id}`);
      await set(primateRef, updatedPrimate);
      
      // Close modal first
      setModalVisible(false);
      setIsEditing(false);
      setEditingPrimate(null);
      clearForm();
      
      // Show success message after modal is closed
      console.log('Primate updated successfully');
      Alert.alert("Success", "Primate updated successfully");
    } catch (error) {
      console.error("Error updating primate:", error);
      Alert.alert("Error", "Failed to update primate");
    }
  };

  const clearForm = () => {
    setName("");
    setCommonName("");
    setAge("");
    setSex("");
    setHealthStatus('Healthy');
    setShowForm(false);
  };

  const renderAnimalCard = ({ item }: { item: Animal }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={20} color="#3498db" />
          </TouchableOpacity>
          <Text style={[styles.statusBadge, 
            { backgroundColor: item.status === 'Alive' ? '#2ecc71' : '#e74c3c' }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardText}>Species: {item.species}</Text>
        <Text style={styles.cardText}>Age: {item.age}</Text>
        <Text style={styles.cardText}>Sex: {item.sex}</Text>
        <Text style={[
          styles.healthStatus,
          item.health === 'Healthy' && styles.healthyStatus,
          item.health === 'Unhealthy/Ill' && styles.unhealthyStatus,
          item.health === 'Convalescing' && styles.convalescingStatus,
        ]}>
          Health: {item.health}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setShowForm(true);
          setModalVisible(true);
          clearForm();
        }}
      >
        <Text style={styles.addButtonText}>Add New Primate</Text>
      </TouchableOpacity>

      <FlatList
        data={animals}
        renderItem={renderAnimalCard}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          clearForm();
          setModalVisible(false);
          setIsEditing(false);
          setEditingPrimate(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Primate</Text>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={(text) => {
                if (text.length <= 50) {
                  setName(text.replace(/[^a-zA-Z0-9\s-]/g, ''));
                }
              }}
              placeholder="Enter primate name"
              maxLength={50}
            />
            <Text style={styles.characterCount}>
              {name.length}/50 characters
            </Text>

            <Text style={styles.modalLabel}>Common Name</Text>
            <TextInput
              style={styles.modalInput}
              value={commonName}
              onChangeText={(text) => {
                if (text.length <= 100) {
                  setCommonName(text.replace(/[^a-zA-Z\s-]/g, ''));
                }
              }}
              placeholder="e.g., Chimpanzee"
              maxLength={100}
            />
            <Text style={styles.characterCount}>
              {commonName.length}/100 characters
            </Text>

            <Text style={styles.modalLabel}>Age</Text>
            <TextInput
              style={styles.modalInput}
              value={age}
              onChangeText={(text) => {
                const newText = text.replace(/[^0-9.]/g, '');
                if (newText.split('.').length <= 2) {
                  setAge(newText);
                }
              }}
              placeholder="Enter age"
              keyboardType="decimal-pad"
              maxLength={5}
            />

            <Text style={styles.modalLabel}>Sex</Text>
            <View style={styles.sexPicker}>
              <TouchableOpacity
                style={[
                  styles.sexButton,
                  sex === "male" && styles.selectedSexButton
                ]}
                onPress={() => setSex("male")}
              >
                <Text style={[
                  styles.sexButtonText,
                  sex === "male" && styles.selectedSexButtonText
                ]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sexButton,
                  sex === "female" && styles.selectedSexButton
                ]}
                onPress={() => setSex("female")}
              >
                <Text style={[
                  styles.sexButtonText,
                  sex === "female" && styles.selectedSexButtonText
                ]}>Female</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Health Status</Text>
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  clearForm();
                  setModalVisible(false);
                  setIsEditing(false);
                  setEditingPrimate(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible && !isEditing}
        onRequestClose={() => {
          setModalVisible(false);
          clearForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Primate</Text>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={(text) => {
                if (text.length <= 50) {
                  setName(text.replace(/[^a-zA-Z0-9\s-]/g, ''));
                }
              }}
              placeholder="Enter primate name"
              maxLength={50}
            />
            <Text style={styles.characterCount}>
              {name.length}/50 characters
            </Text>

            <Text style={styles.modalLabel}>Common Name</Text>
            <TextInput
              style={styles.modalInput}
              value={commonName}
              onChangeText={(text) => {
                if (text.length <= 100) {
                  setCommonName(text.replace(/[^a-zA-Z\s-]/g, ''));
                }
              }}
              placeholder="e.g., Chimpanzee"
              maxLength={100}
            />
            <Text style={styles.characterCount}>
              {commonName.length}/100 characters
            </Text>

            <Text style={styles.modalLabel}>Age</Text>
            <TextInput
              style={styles.modalInput}
              value={age}
              onChangeText={(text) => {
                const newText = text.replace(/[^0-9.]/g, '');
                if (newText.split('.').length <= 2) {
                  setAge(newText);
                }
              }}
              placeholder="Enter age"
              keyboardType="decimal-pad"
              maxLength={5}
            />

            <Text style={styles.modalLabel}>Sex</Text>
            <View style={styles.sexPicker}>
              <TouchableOpacity
                style={[
                  styles.sexButton,
                  sex === "male" && styles.selectedSexButton
                ]}
                onPress={() => setSex("male")}
              >
                <Text style={[
                  styles.sexButtonText,
                  sex === "male" && styles.selectedSexButtonText
                ]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sexButton,
                  sex === "female" && styles.selectedSexButton
                ]}
                onPress={() => setSex("female")}
              >
                <Text style={[
                  styles.sexButtonText,
                  sex === "female" && styles.selectedSexButtonText
                ]}>Female</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Health Status</Text>
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  clearForm();
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  formContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDetails: {
    gap: 5,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#34495e",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "white",
    fontSize: 16,
  },
  sexPicker: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  sexButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    alignItems: "center",
    backgroundColor: "white",
  },
  selectedSexButton: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  sexButtonText: {
    fontSize: 16,
    color: "#34495e",
  },
  selectedSexButtonText: {
    color: "white",
  },
  saveButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    color: "red",
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 15,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    padding: 5,
  },
  healthStatus: {
    fontSize: 14,
    color: "#666",
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
    maxHeight: '90%',
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
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
