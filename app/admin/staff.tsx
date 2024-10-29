import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StaffMember {
  id: string;
  name: string;
  section: string;
  username: string;
}

const SECTIONS = ['big_cats', 'reptiles', 'primates', 'birds', 'aquatic'];

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: 'John Doe', section: 'big_cats', username: 'john' },
    { id: '2', name: 'Sarah Smith', section: 'reptiles', username: 'sarah' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [section, setSection] = useState('');

  const handleAddStaff = () => {
    if (!name || !username || !section) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newStaff = {
      id: Date.now().toString(),
      name,
      username,
      section,
    };

    setStaff([...staff, newStaff]);
    clearForm();
  };

  const handleEditStaff = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setName(staffMember.name);
    setUsername(staffMember.username);
    setSection(staffMember.section);
    setModalVisible(true);
  };

  const handleUpdateStaff = () => {
    if (!editingStaff) return;

    const updatedStaff = staff.map(s => 
      s.id === editingStaff.id 
        ? { ...s, name, username, section }
        : s
    );

    setStaff(updatedStaff);
    clearForm();
  };

  const handleDeleteStaff = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this staff member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setStaff(staff.filter(s => s.id !== id));
          },
        },
      ]
    );
  };

  const clearForm = () => {
    setName('');
    setUsername('');
    setSection('');
    setEditingStaff(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Staff Member</Text>
      </TouchableOpacity>

      <FlatList
        data={staff}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.staffCard}>
            <View>
              <Text style={styles.staffName}>{item.name}</Text>
              <Text style={styles.staffUsername}>@{item.username}</Text>
              <Text style={styles.staffSection}>Section: {item.section}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleEditStaff(item)}
                style={styles.editButton}
              >
                <MaterialIcons name="edit" size={24} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteStaff(item.id)}
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
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </Text>
            
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              autoCapitalize="none"
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={clearForm}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editingStaff ? handleUpdateStaff : handleAddStaff}
              >
                <Text style={styles.buttonText}>
                  {editingStaff ? 'Update' : 'Save'}
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
  staffCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  staffUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  staffSection: {
    fontSize: 14,
    color: '#2196F3',
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