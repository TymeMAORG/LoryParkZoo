import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
  Modal,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker for dropdown
import { Species, ANIMAL_GROUPS } from "./types";
import { Staff } from "./types";

export default function AdminDashboard() {
  const [staff, setStaff] = useState<Staff[]>([
    { id: 1, name: "John Doe", animalGroup: "Birds", dateAdded: "2024-10-01" },
    {
      id: 2,
      name: "Jane Smith",
      animalGroup: "Big Cats",
      dateAdded: "2024-10-02",
    },
  ]);

  const [nextId, setNextId] = useState(3); // Starts from 3
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [name, setName] = useState("");
  const [animalGroup, setAnimalGroup] = useState("");

  // State to manage Picker visibility
  const [isPickerVisible, setPickerVisible] = useState(false);

  // Toggle Picker visibility
  const togglePicker = () => {
    setPickerVisible(!isPickerVisible);
  };

  // Toggle Modal for Add/Edit
  const toggleModal = () => setModalVisible(!isModalVisible);

  // Open Modal to Add New Staff
  const openAddStaffModal = () => {
    setIsEditing(false);
    setName("");
    setAnimalGroup("");
    toggleModal();
  };

  // Open Modal to Edit Staff
  const openEditStaffModal = (staff: Staff) => {
    setIsEditing(true);
    setSelectedStaff(staff);
    setName(staff.name);
    setAnimalGroup(staff.animalGroup);
    toggleModal();
  };

  // Add New Staff
  const addStaff = () => {
    const newStaff: Staff = {
      id: nextId,
      name,
      animalGroup,
      dateAdded: new Date().toISOString().split("T")[0],
    };
    setStaff([...staff, newStaff]);
    setNextId(nextId + 1);
    toggleModal();
  };

  // Edit Existing Staff
  const editStaff = () => {
    if (selectedStaff) {
      const updatedStaff = staff.map((item) =>
        item.id === selectedStaff.id ? { ...item, name, animalGroup } : item,
      );
      setStaff(updatedStaff);
      toggleModal();
    }
  };

  // Delete Staff
  const deleteStaff = (id: number) => {
    Alert.alert("Delete Staff", "Are you sure you want to delete this staff?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: () => setStaff(staff.filter((item) => item.id !== id)),
      },
    ]);
  };

  // Render Staff Row
  const renderItem = ({ item }: { item: Staff }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.animalGroup}</Text>
      {/* <Text style={styles.cell}>{item.dateAdded}</Text> */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => openEditStaffModal(item)}
      >
        <Text>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteStaff(item.id)}
      >
        <Text>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.sectionTitle}>Staff</Text>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>ID</Text>
        <Text style={styles.headerCell}>Name</Text>
        <Text style={styles.headerCell}>Animal Group</Text>
        {/* <Text style={styles.headerCell}>Date Added</Text> */}
        <Text style={styles.headerCell}>Actions</Text>
      </View>

      {/* Table Rows */}
      <FlatList
        data={staff}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      {/* Add Staff Button */}
      <Button title="Add Staff" onPress={openAddStaffModal} />

      {/* Add/Edit Staff Modal */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditing ? "Edit Staff" : "Add Staff"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
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
            title={isEditing ? "Save Changes" : "Add Staff"}
            onPress={isEditing ? editStaff : addStaff}
          />
          <Button title="Cancel" color="red" onPress={toggleModal} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
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
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#6c757d",
    padding: 5,
    borderRadius: 5,
    margin: 4,
  },
  deleteButton: {
    backgroundColor: "#d9534f",
    padding: 5,
    borderRadius: 5,
    margin: 4,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
  },
  picker: {
    height: 150,
    marginBottom: 33,
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
});
