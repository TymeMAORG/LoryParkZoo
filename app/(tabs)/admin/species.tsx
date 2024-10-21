import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker for dropdown
import { Species, ANIMAL_GROUPS } from "./types";

const AdminScreen = () => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [speciesName, setSpeciesName] = useState("");
  const [animalGroup, setAnimalGroup] = useState("bigcats"); // Default value for dropdown
  const [lastId, setLastId] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSpeciesId, setCurrentSpeciesId] = useState<number | null>(null);

  // State to manage Picker visibility
  const [isPickerVisible, setPickerVisible] = useState(false);

  // Toggle Picker visibility
  const togglePicker = () => {
    setPickerVisible(!isPickerVisible);
  };

  // Toggle Modal visibility
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Open Add Species Modal
  const openAddSpeciesModal = () => {
    setSpeciesName("");
    setAnimalGroup("bigcats"); // Reset to default
    setIsEditing(false);
    toggleModal();
  };

  // Open Edit Species Modal
  const openEditSpeciesModal = (species: Species) => {
    setSpeciesName(species.speciesName);
    setAnimalGroup(species.animalGroup);
    setIsEditing(true);
    setCurrentSpeciesId(species.id);
    toggleModal();
  };

  // Add new species
  const addSpecies = () => {
    const newSpecies: Species = {
      id: lastId + 1,
      speciesName,
      animalGroup,
    };
    setSpeciesList([...speciesList, newSpecies]);
    setLastId(lastId + 1);
    toggleModal();
  };

  // Edit existing species
  const editSpecies = () => {
    if (currentSpeciesId !== null) {
      const updatedList = speciesList.map((species) =>
        species.id === currentSpeciesId
          ? { id: species.id, speciesName, animalGroup }
          : species,
      );
      setSpeciesList(updatedList);
      toggleModal();
    }
  };

  // Delete species
  const deleteSpecies = (id: number) => {
    const filteredList = speciesList.filter((item) => item.id !== id);
    setSpeciesList(filteredList);
  };

  // Render species row
  const renderSpeciesItem = ({ item }: { item: Species }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.speciesName}</Text>
      <Text style={styles.cell}>{item.animalGroup}</Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => openEditSpeciesModal(item)}
      >
        <Text>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteSpecies(item.id)}
      >
        <Text>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.sectionTitle}>Species</Text>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>ID</Text>
        <Text style={styles.headerCell}>Species Name</Text>
        <Text style={styles.headerCell}>Animal Group</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View>

      {/* Table Rows */}
      <FlatList
        data={speciesList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSpeciesItem}
      />

      {/* Add Species Button */}
      <Button title="Add Species" onPress={openAddSpeciesModal} />

      {/* Add/Edit Species Modal */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditing ? "Edit Species" : "Add Species"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Species Name"
            value={speciesName}
            onChangeText={setSpeciesName}
          />

          {/* Dropdown trigger button */}
          <TouchableOpacity
            onPress={togglePicker}
            style={styles.dropdownButton}
          >
            <Text style={styles.dropdownButtonText}>
              {animalGroup ? animalGroup : "Select Animal Group"}
            </Text>
          </TouchableOpacity>

          {/* Conditionally render the Picker only when it's expanded */}
          {isPickerVisible && (
            <Picker
              selectedValue={animalGroup}
              onValueChange={(itemValue) => setAnimalGroup(itemValue)}
              style={styles.picker}
            >
              {ANIMAL_GROUPS.map((group) => (
                <Picker.Item
                  key={group.value}
                  label={group.label}
                  value={group.value}
                />
              ))}
            </Picker>
          )}

          <Button
            title={isEditing ? "Save Changes" : "Add Species"}
            onPress={isEditing ? editSpecies : addSpecies}
          />
          <Button title="Cancel" color="red" onPress={toggleModal} />
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerCell: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#6c757d",
    padding: 5,
    borderRadius: 5,
    margin: 2,
  },
  deleteButton: {
    margin: 2,
    backgroundColor: "#dc3545",
    padding: 5,
    borderRadius: 5,
  },
  modalContent: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 20,
    padding: 10,
  },
  dropdownButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdownButtonText: {
    color: "#333",
    fontSize: 16,
  },
  picker: {
    height: 150,
    marginBottom: 33,
  },
});

export default AdminScreen;
