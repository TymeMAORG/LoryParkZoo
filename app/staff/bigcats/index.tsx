import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  FlatList,
  Modal
} from "react-native";
import { ref, push, set, onValue, off } from "firebase/database";
import { database } from "../../../firebaseConfig";
import { Ionicons } from '@expo/vector-icons';

interface Animal {
  id: string;
  name: string;
  species: string;
  coatPattern: string;
  age: string;
  sex: string;
  health: string;
  status: string;
  dateAdded: string;
}

type HealthStatus = 'Healthy' | 'Unhealthy/Ill' | 'Convalescing';

export default function BigCatsHome() {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [coatPattern, setCoatPattern] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('Healthy');
  const [modalVisible, setModalVisible] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const animalsRef = ref(database, 'animals');
    console.log('Setting up real-time listener for BigCats');
    
    const unsubscribe = onValue(animalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Received data:', data);
        
        const bigCatsArray = Object.entries(data)
          .map(([id, animal]: [string, any]) => ({
            id,
            ...animal
          }))
          .filter(animal => {
            console.log('Checking animal:', animal);
            return animal.section === "BigCats";
          });
        
        console.log('Filtered BigCats:', bigCatsArray);
        setAnimals(bigCatsArray);
      } else {
        console.log('No data in snapshot');
        setAnimals([]);
      }
    }, (error) => {
      console.error('Error in real-time listener:', error);
    });

    return () => {
      console.log('Cleaning up listener');
      off(animalsRef);
    };
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !species.trim() || !coatPattern.trim() || !age || !sex || !healthStatus) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const animalData = {
        name: name.trim(),
        species: species.trim(),
        coatPattern: coatPattern.trim(),
        health: healthStatus,
        section: "BigCats",
        status: "Alive",
        age,
        sex,
        dateAdded: timestamp
      };

      console.log('Saving big cat with data:', animalData);

      const animalsRef = ref(database, 'animals');
      const newAnimalRef = push(animalsRef);
      await set(newAnimalRef, animalData);
      
      setModalVisible(false);
      clearForm();
      Alert.alert("Success", "Big cat added successfully");
    } catch (error) {
      console.error("Error saving big cat:", error);
      Alert.alert("Error", "Failed to save big cat data");
    }
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setName(animal.name);
    setSpecies(animal.species);
    setCoatPattern(animal.coatPattern);
    setAge(animal.age);
    setSex(animal.sex as "male" | "female");
    setHealthStatus(animal.health as HealthStatus);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingAnimal) return;

    if (!name.trim() || !species.trim() || !coatPattern.trim() || !age || !sex || !healthStatus) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const updatedAnimal = {
        name,
        species,
        coatPattern,
        health: healthStatus,
        section: "BigCats",
        status: editingAnimal.status,
        age,
        sex,
        dateAdded: editingAnimal.dateAdded,
        lastUpdated: timestamp
      };

      const animalRef = ref(database, `animals/${editingAnimal.id}`);
      await set(animalRef, updatedAnimal);
      
      setModalVisible(false);
      setIsEditing(false);
      setEditingAnimal(null);
      clearForm();
      Alert.alert("Success", "Big cat updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update big cat");
    }
  };

  const clearForm = () => {
    setName("");
    setSpecies("");
    setCoatPattern("");
    setAge("");
    setSex("");
    setHealthStatus('Healthy');
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
        <Text style={styles.cardText}>Coat/Pattern: {item.coatPattern}</Text>
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
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add New Big Cat</Text>
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
          setModalVisible(false);
          setIsEditing(false);
          setEditingAnimal(null);
          clearForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Big Cat' : 'Add New Big Cat'}
            </Text>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter big cat name"
              maxLength={50}
            />

            <Text style={styles.modalLabel}>Species</Text>
            <TextInput
              style={styles.modalInput}
              value={species}
              onChangeText={setSpecies}
              placeholder="e.g., Lion, Tiger"
              maxLength={100}
            />

            <Text style={styles.modalLabel}>Coat/Pattern</Text>
            <TextInput
              style={styles.modalInput}
              value={coatPattern}
              onChangeText={setCoatPattern}
              placeholder="e.g., Striped, Spotted"
              maxLength={100}
            />

            <Text style={styles.modalLabel}>Age</Text>
            <TextInput
              style={styles.modalInput}
              value={age}
              onChangeText={setAge}
              placeholder="Enter age"
              keyboardType="decimal-pad"
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
                  setIsEditing(false);
                  setEditingAnimal(null);
                  clearForm();
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={isEditing ? handleUpdate : handleSave}
              >
                <Text style={styles.modalButtonText}>
                  {isEditing ? 'Update' : 'Save'}
                </Text>
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
  cardDetails: {
    gap: 5,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  healthStatus: {
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
  selectedHealthButton: {
    borderWidth: 0,
  },
  healthButtonText: {
    fontSize: 16,
    color: "#34495e",
  },
  selectedHealthButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
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
  modalSaveButton: {
    backgroundColor: '#2ecc71',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    padding: 5,
  },
});
