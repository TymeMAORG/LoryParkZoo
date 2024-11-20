import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ref, get, set, push, child } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { router } from 'expo-router';

interface Section {
  id: string;
  name: string;
}

export default function AnimalManagement() {
  const [sections, setSections] = useState<Section[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [section, setSection] = useState('');
  const [health, setHealth] = useState('');
  const [status, setStatus] = useState<'alive' | 'deceased'>('alive');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    const sectionsRef = ref(database, 'sections');
    const snapshot = await get(sectionsRef);
    if (snapshot.exists()) {
      const sectionsData = snapshot.val();
      const sectionsArray = Object.entries(sectionsData).map(([id, data]: [string, any]) => ({
        id,
        name: data.name,
      }));
      setSections(sectionsArray);
    }
  };

  const handleAddAnimal = async () => {
    if (!name || !species || !section || !health) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newAnimal = {
      name,
      species,
      section,
      health,
      status,
    };

    try {
      const newAnimalRef = push(child(ref(database), 'animals'));
      await set(newAnimalRef, newAnimal);
      clearForm();
      Alert.alert('Success', 'Animal added successfully');
    } catch (error) {
      console.error('Error adding animal:', error);
      Alert.alert('Error', 'Failed to add animal');
    }
  };

  const clearForm = () => {
    setName('');
    setSpecies('');
    setSection('');
    setHealth('');
    setStatus('alive');
    setModalVisible(false);
  };

  const navigateToSection = (sectionId: string) => {
    router.push(`/admin/sections/${sectionId}` as any);
  };

  const renderItem = ({ item }: { item: Section }) => (
    <TouchableOpacity
      style={styles.sectionCard}
      onPress={() => navigateToSection(item.id)}
    >
      <Text style={styles.sectionName}>{item.name}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Animal</Text>
      </TouchableOpacity>

      <FlatList
        data={sections}
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
            <Text style={styles.modalTitle}>Add New Animal</Text>
            
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

            <Text style={styles.label}>Section</Text>
            <View style={styles.sectionPicker}>
              {sections.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.sectionButton,
                    section === s.name && styles.sectionButtonActive,
                  ]}
                  onPress={() => setSection(s.name)}
                >
                  <Text
                    style={[
                      styles.sectionButtonText,
                      section === s.name && styles.sectionButtonTextActive,
                    ]}
                  >
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
                onPress={handleAddAnimal}
              >
                <Text style={styles.buttonText}>Save</Text>
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
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  sectionCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionName: {
    fontSize: 16,
    fontWeight: 'bold',
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
  animalSection: {
    fontSize: 14,
    color: '#2196F3',
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
  sectionPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  sectionButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 4,
  },
  sectionButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  sectionButtonText: {
    color: '#666',
  },
  sectionButtonTextActive: {
    color: 'white',
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