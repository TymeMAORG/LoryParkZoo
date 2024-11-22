import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { ref, get, DataSnapshot } from 'firebase/database';
import { database } from '../firebaseConfig';

interface UserState {
  username: string;
  section: string;
  isAdmin: boolean;
  setUser: (username: string, section: string, isAdmin: boolean) => void;
  clearUser: () => void;
}

interface User {
  username: string;
  section: string;
}

export const useUserStore = create<UserState>((set) => ({
  username: '',
  section: '',
  isAdmin: false,
  setUser: (username, section, isAdmin) => set({ username, section, isAdmin }),
  clearUser: () => set({ username: '', section: '', isAdmin: false }),
}));

export default function Login() {
  const [username, setUsername] = useState('');
  const [section, setSection] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!username || !section) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Check for admin login first
    if (username.toLowerCase() === 'admin' && section.toLowerCase() === 'admin') {
      if (!showPasswordInput) {
        setShowPasswordInput(true);
        return;
      } else if (password !== 'Admin123') {
        Alert.alert('Error', 'Invalid admin password');
        return;
      }
      setUser('admin', 'admin', true);
      await AsyncStorage.setItem('user', JSON.stringify({ username: 'admin', section: 'admin' }));
      router.replace('/admin');
      return;
    }

    // Non-admin login process
    try {
      const snapshot: DataSnapshot = await get(ref(database, 'staff'));
      const staffData = snapshot.val();
      if (staffData) {
        const users: User[] = Object.values(staffData);
        const user = users.find(
          (u: User) => u.username.toLowerCase() === username.toLowerCase()
        );

        if (!user || user.section !== section) {
          Alert.alert('Error', 'Invalid username or section code');
          return;
        }

        setUser(user.username, user.section, false);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        router.replace(`/staff/${user.section}` as any);
      } else {
        Alert.alert('Error', 'No users found');
      }
    } catch (error) {
      console.error('Login error:', error);
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
        {showPasswordInput && (
          <>
            <Text style={styles.label}>Admin Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter admin password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        )}
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
