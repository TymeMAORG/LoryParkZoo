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

interface Reptile {
  id: string;
  name: string;
  species: string;
  enclosure: string;
  family: string;
  health: string;
  status: string;
  dateAdded: string;
}

type HealthStatus = 'Healthy' | 'Unhealthy/Ill' | 'Convalescing';

export default function ReptilesHome() {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [enclosure, setEnclosure] = useState("");
  const [family, setFamily] = useState("");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('Healthy');
  const [modalVisible, setModalVisible] = useState(false);
  const [reptiles, setReptiles] = useState<Reptile[]>([]);
  const [editingReptile, setEditingReptile] = useState<Reptile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const reptilesRef = ref(database, 'animals');
    
    const unsubscribe = onValue(reptilesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reptilesArray = Object.entries(data)
          .map(([id, animal]: [string, any]) => ({
            id,
            ...animal
          }))
          .filter(animal => animal.section === "Reptiles");
        
        setReptiles(reptilesArray);
      } else {
        setReptiles([]);
      }
    });

    return () => off(reptilesRef);
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !species.trim() || !enclosure.trim() || !family.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const reptileData = {
        name: name.trim(),
        species: species.trim(),
        enclosure: enclosure.trim(),
        family: family.trim(),
        health: healthStatus,
        section: "Reptiles",
        status: "Alive",
        dateAdded: timestamp
      };

      const reptilesRef = ref(database, 'animals');
      const newReptileRef = push(reptilesRef);
      await set(newReptileRef, reptileData);
      
      setModalVisible(false);
      clearForm();
      Alert.alert("Success", "Reptile added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to save reptile data");
    }
  };

  const handleEdit = (reptile: Reptile) => {
    setEditingReptile(reptile);
    setName(reptile.name);
    setSpecies(reptile.species);
    setEnclosure(reptile.enclosure);
    setFamily(reptile.family);
    setHealthStatus(reptile.health as HealthStatus);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingReptile) return;

    if (!name.trim() || !species.trim() || !enclosure.trim() || !family.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const updatedReptile = {
        name,
        species,
        enclosure,
        family,
        health: healthStatus,
        section: "Reptiles",
        status: editingReptile.status,
        dateAdded: editingReptile.dateAdded,
        lastUpdated: timestamp
      };

      const reptileRef = ref(database, `animals/${editingReptile.id}`);
      await set(reptileRef, updatedReptile);
      
      setModalVisible(false);
      setIsEditing(false);
      setEditingReptile(null);
      clearForm();
      Alert.alert("Success", "Reptile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update reptile");
    }
  };

  const clearForm = () => {
    setName("");
    setSpecies("");
    setEnclosure("");
    setFamily("");
    setHealthStatus('Healthy');
  };

  const renderReptileCard = ({ item }: { item: Reptile }) => (
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
        <Text style={styles.cardText}>Enclosure: {item.enclosure}</Text>
        <Text style={styles.cardText}>Family: {item.family}</Text>
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
        <Text style={styles.addButtonText}>Add New Reptile</Text>
      </TouchableOpacity>

      <FlatList
        data={reptiles}
        renderItem={renderReptileCard}
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
          setEditingReptile(null);
          clearForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Reptile' : 'Add New Reptile'}
            </Text>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter reptile name"
              maxLength={50}
            />

            <Text style={styles.modalLabel}>Species</Text>
            <TextInput
              style={styles.modalInput}
              value={species}
              onChangeText={setSpecies}
              placeholder="e.g., Red Tailed Boa, Bearded Dragon"
              maxLength={100}
            />

            <Text style={styles.modalLabel}>Enclosure</Text>
            <TextInput
              style={styles.modalInput}
              value={enclosure}
              onChangeText={setEnclosure}
              placeholder="e.g., RR1, A2"
              maxLength={10}
            />

            <Text style={styles.modalLabel}>Family</Text>
            <TextInput
              style={styles.modalInput}
              value={family}
              onChangeText={setFamily}
              placeholder="e.g., Boidae, Agamidae"
              maxLength={100}
            />

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
                  <Text style={[
                    styles.healthButtonText,
                    healthStatus === status && styles.selectedHealthButtonText
                  ]}>
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
                  setEditingReptile(null);
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    padding: 5,
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
  },
  unhealthyButton: {
    borderColor: "#e74c3c",
  },
  convalescingButton: {
    borderColor: "#f1c40f",
  },
  healthyButtonSelected: {
    backgroundColor: "#2ecc71",
  },
  unhealthyButtonSelected: {
    backgroundColor: "#e74c3c",
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
});
