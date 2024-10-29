import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Animal {
  id: string;
  name: string;
  species: string;
  section: string;
  health: string;
}

const SECTIONS = ['big_cats', 'reptiles', 'primates', 'birds', 'aquatic'];

export default function AnimalManagement() {
  const [animals, setAnimals] = useState<Animal[]>([
    { 
      id: '1', 
      name: 'Leo', 
      species: 'Lion',
      section: 'big_cats',
      health: 'Good'
    },
    { 
      id: '2', 
      name: 'Slither', 
      species: 'Python',
      section: 'reptiles',
      health: 'Excellent'
    },
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [section, setSection] = useState('');
  const [health, setHealth] = useState('');

  const handleAddAnimal = () => {
    if (!name || !species || !section || !health) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newAnimal = {
      id: Date.now().toString(),
      name,
      species,
      section,
      health,
    };

    setAnimals([...animals, newAnimal]);
    clearForm();
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setName(animal.name);
    setSpecies(animal.species);
    setSection(animal.section);
    setHealth(animal.health);
    setModalVisible(true);
  };

  const handleUpdateAnimal = () => {
    if (!editingAnimal) return;

    const updatedAnimals = animals.map(a => 
      a.id === editingAnimal.id 
        ? { ...a, name, species, section, health }
        : a
    );

    setAnimals(updatedAnimals);
    clearForm();
  };

  const handleDeleteAnimal = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this animal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAnimals(animals.filter(a => a.id !== id));
          },
        },
      ]
    );
  };

  const clearForm = () => {
    setName('');
    setSpecies('');
    setSection('');
    setHealth('');
    setEditingAnimal(null);
    setModalVisible(false);
  };

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
        data={animals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.animalCard}>
            <View>
              <Text style={styles.animalName}>{item.name}</Text>
              <Text style={styles.animalSpecies}>{item.species}</Text>
              <Text style={styles.animalSection}>Section: {item.section}</Text>
              <Text style={styles.animalHealth}>Health: {item.health}</Text>
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
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={clearForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingAnimal ? 'Edit Animal' : 'Add New Animal'}
            </Text>
            
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
              {SECTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.sectionButton,
                    section === s && styles.sectionButtonActive,
                  ]}
                  onPress={() => setSection(s)}
                >
                  <Text
                    style={[
                      styles.sectionButtonText,
                      section === s && styles.sectionButtonTextActive,
                    ]}
                  >
                    {s}
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={clearForm}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editingAnimal ? handleUpdateAnimal : handleAddAnimal}
              >
                <Text style={styles.buttonText}>
                  {editingAnimal ? 'Update' : 'Save'}
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