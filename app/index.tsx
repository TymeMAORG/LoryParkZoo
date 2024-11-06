import { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// Define types for our user store
interface UserState {
  username: string;
  section: string;
  isAdmin: boolean;
  setUser: (username: string, section: string, isAdmin: boolean) => void;
  clearUser: () => void;
}

// Create a global store for user state
export const useUserStore = create<UserState>((set) => ({
  username: '',
  section: '',
  isAdmin: false,
  setUser: (username, section, isAdmin) => set({ username, section, isAdmin }),
  clearUser: () => set({ username: '', section: '', isAdmin: false }),
}));

// Mock user data - in a real app, this would come from an API
const MOCK_USERS = [
  { username: 'admin', section: 'all', isAdmin: true },
  { username: 'kyle', section: 'bigcats', isAdmin: false },
  { username: 'robynn', section: 'reptiles', isAdmin: false },
  { username: 'jane', section: 'primates', isAdmin: false },
  { username: 'john', section: 'birds', isAdmin: false },
  { username: 'jeff', section: 'birdsofprey', isAdmin: false },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [section, setSection] = useState('');
  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!username || !section) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const user = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (user.section !== section && user.section !== 'all') {
      Alert.alert('Error', 'Invalid section for this user');
      return;
    }

    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user.username, user.section, user.isAdmin);
      
      // Redirect based on user role
      if (user.isAdmin) {
        router.replace('/admin/');
      } else {
        router.replace(`/staff/${user.section}` as any);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log in');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lory Park Zoo Management</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Staff ID / Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Text style={styles.label}>Section Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your section code"
          value={section}
          onChangeText={setSection}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
});
