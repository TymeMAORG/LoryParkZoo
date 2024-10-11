import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { Href, useRouter } from 'expo-router';

export default function LoginScreen() {
  const users = [
    { username: 'admin', password: 'admin', group: 'admin' },
    { username: 'bigcats', password: 'staff', group: 'staff', animalsection: 'bigcats' },
    { username: 'primates', password: 'staff', group: 'staff', animalsection: 'primates' },
    { username: 'reptiles', password: 'staff', group: 'staff', animalsection: 'reptiles' },
    { username: 'birds', password: 'staff', group: 'staff', animalsection: 'birds' },
    { username: 'birdsofprey', password: 'staff', group: 'staff', animalsection: 'birdsofprey' },
  ];
  
  
  const router = useRouter(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      if (user.group === 'admin') {
        
        router.push('/admin');
      } else if (user.group === 'staff') {
        const path = `/staff/animalgroup/${user.animalsection}?username=${username}` as Href<string>;
        router.push(path) 
      }
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the LoryPark Zoo App</Text>
      {error.length > 0 && <Text style={styles.error}>{error}</Text>}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});
