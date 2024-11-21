import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, FlatList, ScrollView
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ref, get, set, push, child, remove, onValue, off } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { router } from 'expo-router';

interface Section {
  id: string;
  name: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  section: string;
  health: string;
  status: 'Alive' | 'deceased';
  dateAdded: string;
  lastUpdated?: string;
  coatPattern?: string;
  age?: string;
  sex?: 'male' | 'female';
  commonName?: string;
  enclosure?: string;
  family?: string;
}

interface GroupedAnimals {
  [key: string]: Animal[];
}

interface SectionState {
  [key: string]: boolean;
}

interface SectionFields {
  Primates: {
    commonName: string;
    age: string;
    sex: 'male' | 'female' | '';
  };
  Reptiles: {
    enclosure: string;
    family: string;
  };
  // Add other sections as needed
}

export default function AnimalManagement() {
  const [sections, setSections] = useState<Section[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [section, setSection] = useState('');
  const [health, setHealth] = useState('');
  const [status, setStatus] = useState<'Alive' | 'deceased'>('Alive');
  const [coatPattern, setCoatPattern] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [groupedAnimals, setGroupedAnimals] = useState<GroupedAnimals>({});
  const [expandedSections, setExpandedSections] = useState<SectionState>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [commonName, setCommonName] = useState('');
  const [enclosure, setEnclosure] = useState('');
  const [family, setFamily] = useState('');

  useEffect(() => {
    let isMounted = true;
    const animalsRef = ref(database, 'animals');
    
    const unsubscribe = onValue(animalsRef, (snapshot) => {
      if (!isMounted) return;
      if (snapshot.exists()) {
        const data = snapshot.val();
        const animalsArray = Object.entries(data).map(([id, animal]: [string, any]) => ({
          id,
          ...animal
        }));
        
        const grouped = animalsArray.reduce((acc: GroupedAnimals, animal) => {
          if (!acc[animal.section]) {
            acc[animal.section] = [];
          }
          acc[animal.section].push(animal);
          return acc;
        }, {});
        
        setGroupedAnimals(grouped);
        console.log('Grouped animals:', grouped);
      } else {
        setGroupedAnimals({});
      }
    });

    return () => {
      isMounted = false;
      off(animalsRef);
    };
  }, []);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching sections:', error);
      setError('Failed to load sections');
    }
  };

  const validHealthStatuses = ['Healthy', 'Unhealthy/Ill', 'Convalescing'];

  const handleAddAnimal = async () => {
    if (!validHealthStatuses.includes(health)) {
      Alert.alert('Error', 'Please select a valid health status');
      return;
    }

    console.log('Attempting to add animal with section:', section);

    if (!name || !species || !section || !health) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newAnimal: any = {
        name,
        species,
        section,
        health,
        status,
        dateAdded: new Date().toISOString(),
      };

      switch (section) {
        case 'BigCats':
          if (!coatPattern || !age || !sex) {
            Alert.alert('Error', 'Please fill in all required fields for big cats');
            return;
          }
          Object.assign(newAnimal, {
            coatPattern,
            age,
            sex
          });
          break;
        case 'Primates':
          if (!age || !sex) {
            Alert.alert('Error', 'Please fill in all required fields for primates');
            return;
          }
          Object.assign(newAnimal, {
            age,
            sex
          });
          break;
        case 'Reptiles':
          if (!enclosure || !family) {
            Alert.alert('Error', 'Please fill in all required fields for reptiles');
            return;
          }
          Object.assign(newAnimal, {
            enclosure,
            family
          });
          break;
        case 'BirdsOfPrey':
          if (!family) {
            Alert.alert('Error', 'Please fill in all required fields for birds of prey');
            return;
          }
          Object.assign(newAnimal, {
            family
          });
          break;
      }

      console.log('Saving animal with data:', newAnimal);

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
    setStatus('Alive');
    setCoatPattern('');
    setAge('');
    setSex('');
    setCommonName('');
    setEnclosure('');
    setFamily('');
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

  const handleDeleteAnimal = async (animalId: string) => {
    console.log('Starting delete process for animal:', animalId);
    
    if (!animalId) {
      console.error('Delete validation failed: No animal ID provided');
      return;
    }

    const animalRef = ref(database, `animals/${animalId}`);
    
    try {
      const snapshot = await get(animalRef);
      if (!snapshot.exists()) {
        console.error('Delete validation failed: Animal not found');
        Alert.alert('Error', 'Animal not found');
        return;
      }

      const animalData = snapshot.val();
      setAnimalToDelete({ id: animalId, ...animalData });
      setDeleteModalVisible(true);
    } catch (error) {
      console.error('Error in delete process:', error);
      Alert.alert('Error', 'Failed to prepare delete operation');
    }
  };

  const confirmDelete = async () => {
    if (!animalToDelete) return;

    setIsLoading(true);
    try {
      const animalRef = ref(database, `animals/${animalToDelete.id}`);
      await remove(animalRef);
      console.log(`Successfully deleted animal: ${animalToDelete.id}`);
      Alert.alert('Success', `${animalToDelete.name} has been deleted successfully`);
    } catch (error) {
      console.error('Delete operation failed:', error);
      Alert.alert(
        'Error',
        'Failed to delete animal. Please try again or contact support.'
      );
    } finally {
      setIsLoading(false);
      setDeleteModalVisible(false);
      setAnimalToDelete(null);
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleEdit = (animal: Animal) => {
    console.log('Editing animal:', animal);
    setEditingAnimal({
      ...animal,
      dateAdded: animal.dateAdded || new Date().toISOString(),
    });
    setName(animal.name || '');
    setSpecies(animal.species || '');
    setSection(animal.section || '');
    setHealth(animal.health || '');
    setStatus(animal.status || 'Alive');
    
    // Clear all section-specific fields first
    setCoatPattern('');
    setAge('');
    setSex('');
    setCommonName('');
    setEnclosure('');
    setFamily('');
    
    // Set section-specific fields based on the animal's section
    switch (animal.section) {
      case 'BigCats':
        setCoatPattern(animal.coatPattern || '');
        setAge(animal.age || '');
        setSex(animal.sex || '');
        break;
      case 'Primates':
        setCommonName(animal.commonName || '');
        setAge(animal.age || '');
        setSex(animal.sex || '');
        break;
      case 'Reptiles':
        setEnclosure(animal.enclosure || '');
        setFamily(animal.family || '');
        break;
    }
    
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingAnimal) return;

    if (!name || !species || !section || !health) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const normalizedSection = section === 'Big Cats' ? 'BigCats' : section;

    switch (normalizedSection) {
      case 'Primates':
        if (!age || !sex) {
          Alert.alert('Error', 'Please fill in all required fields for primates');
          return;
        }
        break;
      case 'Reptiles':
        if (!enclosure || !family) {
          Alert.alert('Error', 'Please fill in all required fields for reptiles');
          return;
        }
        break;
      case 'BigCats':
        if (!coatPattern || !age || !sex) {
          Alert.alert('Error', 'Please fill in all required fields for big cats');
          return;
        }
        break;
    }

    try {
      const updatedAnimal: any = {
        name,
        species,
        section: normalizedSection,
        health,
        status,
        dateAdded: editingAnimal.dateAdded || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      switch (normalizedSection) {
        case 'Primates':
          Object.assign(updatedAnimal, {
            age,
            sex
          });
          break;
        case 'Reptiles':
          Object.assign(updatedAnimal, {
            enclosure,
            family
          });
          break;
        case 'BigCats':
          Object.assign(updatedAnimal, {
            coatPattern,
            age,
            sex
          });
          break;
      }

      const animalRef = ref(database, `animals/${editingAnimal.id}`);
      await set(animalRef, updatedAnimal);
      
      clearForm();
      setIsEditing(false);
      setEditingAnimal(null);
      Alert.alert('Success', 'Animal updated successfully');
    } catch (error) {
      console.error('Error updating animal:', error);
      Alert.alert('Error', 'Failed to update animal');
    }
  };

  const renderSection = ({ item: sectionName }: { item: string }) => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(sectionName)}
      >
        <Text style={styles.sectionHeaderText}>{sectionName}</Text>
        <MaterialIcons
          name={expandedSections[sectionName] ? "expand-less" : "expand-more"}
          size={24}
          color="#666"
        />
      </TouchableOpacity>
      
      {expandedSections[sectionName] && groupedAnimals[sectionName]?.map((animal) => (
        <View key={animal.id} style={styles.animalCard}>
          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>{animal.name}</Text>
            <Text style={styles.animalSpecies}>{animal.species}</Text>
            <Text style={[
              styles.animalStatus,
              animal.status === 'deceased' && styles.animalStatusDeceased
            ]}>
              Status: {animal.status}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(animal)}
            >
              <Ionicons name="pencil" size={20} color="#3498db" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteAnimal(animal.id)}
            >
              <MaterialIcons name="delete" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const validateAge = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  };

  const renderSectionFields = () => {
    switch (section) {
      case 'Primates':
        return (
          <>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
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

            <Text style={styles.label}>Sex *</Text>
            <View style={styles.sexPicker}>
              <TouchableOpacity
                style={[
                  styles.sexButton,
                  sex === "male" && styles.sexButtonActive
                ]}
                onPress={() => setSex("male")}
              >
                <Text style={[
                  styles.sexButtonText,
                  sex === "male" && styles.sexButtonTextActive
                ]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sexButton,
                  sex === "female" && styles.sexButtonActive
                ]}
                onPress={() => setSex("female")}
              >
                <Text style={[
                  styles.sexButtonText,
                  sex === "female" && styles.sexButtonTextActive
                ]}>Female</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'Reptiles':
        return (
          <>
            <Text style={styles.label}>Enclosure</Text>
            <TextInput
              style={styles.input}
              value={enclosure}
              onChangeText={setEnclosure}
              placeholder="e.g., RR1, A2"
              maxLength={10}
            />

            <Text style={styles.label}>Family</Text>
            <TextInput
              style={styles.input}
              value={family}
              onChangeText={setFamily}
              placeholder="e.g., Boidae, Agamidae"
              maxLength={100}
            />
          </>
        );

      case 'BigCats':
        return (
          <>
            <Text style={styles.label}>Coat Pattern *</Text>
            <TextInput
              style={styles.input}
              value={coatPattern}
              onChangeText={setCoatPattern}
              placeholder="e.g., Spotted, Striped"
              maxLength={50}
            />

            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
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

            <Text style={styles.label}>Sex *</Text>
            <View style={styles.sexPicker}>
              <TouchableOpacity
                style={[
                  styles.sexButton,
                  sex === "male" && styles.sexButtonActive
                ]}
                onPress={() => setSex("male")}
              >
                <Text style={[
                  styles.sexButtonText,
                  sex === "male" && styles.sexButtonTextActive
                ]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sexButton,
                  sex === "female" && styles.sexButtonActive
                ]}
                onPress={() => setSex("female")}
              >
                <Text style={[
                  styles.sexButtonText,
                  sex === "female" && styles.sexButtonTextActive
                ]}>Female</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      
      case 'BirdsOfPrey':
        return (
          <>
            <Text style={styles.label}>Family *</Text>
            <TextInput
              style={styles.input}
              value={family}
              onChangeText={setFamily}
              placeholder="e.g., Accipitridae, Falconidae"
              maxLength={100}
            />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsEditing(false);
          setEditingAnimal(null);
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Animal</Text>
      </TouchableOpacity>

      <FlatList
        data={Object.keys(groupedAnimals)}
        renderItem={renderSection}
        keyExtractor={(item) => item}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={clearForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Animal' : 'Add New Animal'}
              </Text>
              
              <Text style={styles.label}>Select a Section: </Text>
              <View style={styles.sectionPicker}>
                {sections.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.sectionButton,
                      section === s.name && styles.sectionButtonActive,
                    ]}
                    onPress={() => {
                      let normalizedName = s.name;
                      if (s.name === 'Big Cats') normalizedName = 'BigCats';
                      if (s.name === 'Birds of Prey') normalizedName = 'BirdsOfPrey';
                      setSection(normalizedName);
                    }}
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

              {section && (
                <>
                  <Text style={styles.label}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter animal name"
                  />

                  <Text style={styles.label}>Species *</Text>
                  <TextInput
                    style={styles.input}
                    value={species}
                    onChangeText={setSpecies}
                    placeholder="Enter species"
                  />

                  {renderSectionFields()}

                  <Text style={styles.label}>Health Status *</Text>
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
                        status === 'Alive' && styles.statusButtonActive,
                      ]}
                      onPress={() => setStatus('Alive')}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          status === 'Alive' && styles.statusButtonTextActive,
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
                      onPress={isEditing ? handleUpdate : handleAddAnimal}
                    >
                      <Text style={styles.buttonText}>
                        {isEditing ? 'Update' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { padding: 20 }]}>
            <Text style={[styles.modalTitle, { color: '#FF0000' }]}>Confirm Delete</Text>
            
            {animalToDelete && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.deleteModalText}>Are you sure you want to delete:</Text>
                <Text style={styles.deleteModalDetail}>Name: {animalToDelete.name}</Text>
                <Text style={styles.deleteModalDetail}>Species: {animalToDelete.species}</Text>
                <Text style={styles.deleteModalDetail}>Section: {animalToDelete.section}</Text>
                <Text style={styles.deleteModalWarning}>This action cannot be undone.</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setAnimalToDelete(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FF0000' }]}
                onPress={confirmDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
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
    elevation: 2,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  animalSpecies: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  animalSection: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 2,
  },
  animalStatus: {
    fontSize: 14,
    color: '#4CAF50',
  },
  animalStatusDeceased: {
    color: '#FF6B6B',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: '#2196F3',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sexPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sexButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  sexButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  sexButtonText: {
    color: '#666',
  },
  sexButtonTextActive: {
    color: 'white',
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  deleteModalDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  deleteModalWarning: {
    fontSize: 14,
    color: '#FF0000',
    marginTop: 10,
    fontWeight: 'bold',
  },
});