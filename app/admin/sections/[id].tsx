import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ref, get, remove, set } from 'firebase/database';
import { database } from '../../../firebaseConfig';
import { useLocalSearchParams } from 'expo-router';

interface Animal {
  id: string;
  name: string;
  species: string;
  section: string;
  health: string;
  status: 'alive' | 'deceased';
}

export default function SectionAnimals() {
  const { id } = useLocalSearchParams();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [sectionName, setSectionName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [health, setHealth] = useState('');
  const [status, setStatus] = useState<'alive' | 'deceased'>('alive');

  useEffect(() => {
    fetchSectionAnimals();
  }, [id, sectionName]);

  const fetchSectionAnimals = async () => {
    const sectionRef = ref(database, `sections/${id}`);
    const sectionSnapshot = await get(sectionRef);
    if (sectionSnapshot.exists()) {
      const sectionData = sectionSnapshot.val();
      setSectionName(sectionData.name);

      const animalsRef = ref(database, 'animals');
      const snapshot = await get(animalsRef);
      if (snapshot.exists()) {
        const animalsData = snapshot.val();
        const animalsArray = Object.entries(animalsData)
          .map(([animalId, data]: [string, any]) => ({
            id: animalId,
            ...data,
          }))
          .filter((animal: Animal) => animal.section === sectionData.name);
        setAnimals(animalsArray);
      }
    }
  };

  const handleDeleteAnimal = async (animalId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this animal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(database, `animals/${animalId}`));
              fetchSectionAnimals();
            } catch (error) {
              console.error('Error deleting animal:', error);
              Alert.alert('Error', 'Failed to delete animal');
            }
          },
        },
      ]
    );
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setName(animal.name);
    setSpecies(animal.species);
    setHealth(animal.health);
    setStatus(animal.status);
    setModalVisible(true);
  };

  const handleUpdateAnimal = async () => {
    if (!editingAnimal) return;

    const updatedAnimal: Omit<Animal, 'id'> = {
      name,
      species,
      section: sectionName,
      health,
      status,
    };

    try {
      await set(ref(database, `animals/${editingAnimal.id}`), updatedAnimal);
      clearForm();
      fetchSectionAnimals();
    } catch (error) {
      console.error('Error updating animal:', error);
      Alert.alert('Error', 'Failed to update animal');
    }
  };

  const clearForm = () => {
    setName('');
    setSpecies('');
    setHealth('');
    setStatus('alive');
    setEditingAnimal(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Animal }) => (
    <View style={styles.animalCard}>
      <View>
        <Text style={styles.animalName}>{item.name}</Text>
        <Text style={styles.animalSpecies}>{item.species}</Text>
        <Text style={styles.animalHealth}>Health: {item.health}</Text>
        <Text style={[styles.animalStatus, item.status === 'deceased' && styles.animalStatusDeceased]}>
          Status: {item.status}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => handleEditAnimal(item)}
          style={styles.editButton}
        >
          <MaterialIcons name="edit" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteAnimal(item.id)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{sectionName}</Text>
      <FlatList
        data={animals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={clearForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Animal</Text>
            
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter animal name"
            />

            <Text style={styles.label}>Species</Text>
            <TextInput
              style={styles.input}
              value={species}
              onChangeText={setSpecies}
              placeholder="Enter species"
            />

            <Text style={styles.label}>Health Status</Text>
            <TextInput
              style={styles.input}
              value={health}
              onChangeText={setHealth}
              placeholder="Enter health status"
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.statusPicker}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === 'alive' && styles.statusButtonActive,
                ]}
                onPress={() => setStatus('alive')}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === 'alive' && styles.statusButtonTextActive,
                  ]}
                >
                  Alive
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === 'deceased' && styles.statusButtonActive,
                ]}
                onPress={() => setStatus('deceased')}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === 'deceased' && styles.statusButtonTextActive,
                  ]}
                >
                  Deceased
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={clearForm}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateAnimal}
              >
                <Text style={styles.buttonText}>Update</Text>
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
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  animalCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  animalSpecies: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  animalHealth: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  animalStatus: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  animalStatusDeceased: {
    color: '#FF6B6B',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
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
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  statusPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  statusButtonText: {
    color: '#666',
  },
  statusButtonTextActive: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});