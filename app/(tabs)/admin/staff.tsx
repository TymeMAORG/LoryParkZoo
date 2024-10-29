import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StaffMember {
  id: string;
  name: string;
  section: string;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: 'John Doe', section: 'big_cats' },
    { id: '2', name: 'Sarah Smith', section: 'reptiles' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffSection, setNewStaffSection] = useState('');

  const addStaffMember = () => {
    if (!newStaffName || !newStaffSection) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newStaff = {
      id: Date.now().toString(),
      name: newStaffName,
      section: newStaffSection,
    };

    setStaff([...staff, newStaff]);
    setModalVisible(false);
    setNewStaffName('');
    setNewStaffSection('');
  };

  const deleteStaffMember = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this staff member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setStaff(staff.filter(member => member.id !== id));
          },
        },
      ]
    );
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

      <ScrollView style={styles.staffList}>
        {staff.map((member) => (
          <View key={member.id} style={styles.staffCard}>
            <View>
              <Text style={styles.staffName}>{member.name}</Text>
              <Text style={styles.staffSection}>Section: {member.section}</Text>
            </View>
            <TouchableOpacity
              onPress={() => deleteStaffMember(member.id)}
              style={styles.deleteButton}
            >
              <MaterialIcons name="delete" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Staff Member</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newStaffName}
              onChangeText={setNewStaffName}
            />
            <TextInput
              style={styles.input}
              placeholder="Section"
              value={newStaffSection}
              onChangeText={setNewStaffSection}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addStaffMember}
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
  staffList: {
    flex: 1,
  },
  staffCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  staffSection: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deleteButton: {
    padding: 10,
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
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
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
