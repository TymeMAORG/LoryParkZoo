// /app/(tabs)/staff/animalgroup/birdsofprey/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Birds of prey data
const birdsOfPrey = [
  { id: 1, name: 'Sky', species: 'Bald Eagle', family: 'Accipitridae' },
  { id: 2, name: 'Thor', species: 'Golden Eagle', family: 'Accipitridae' },
  { id: 3, name: 'Zeus', species: 'Vulture', family: 'Accipitridae' },
  { id: 4, name: 'Athena', species: 'Vulture', family: 'Accipitridae' },
  { id: 5, name: 'Ares', species: 'Falcon', family: 'Falconidae' },
  { id: 6, name: 'Apollo', species: 'Falcon', family: 'Falconidae' },
];

export default function BirdsOfPreyHome() {
  const router = useRouter();
  const { username } = useLocalSearchParams();

  const handleBirdSelect = (bird: { id?: React.Key | null | undefined; name: string; species: string }) => {
    router.push({
      pathname: '/staff/animalgroup/birdsofprey/foodmonitoring',
      params: {
        name: bird.name,
        species: bird.species,
        keeper: username,
      },
    });
  };

  const groupedBirds = birdsOfPrey.reduce((acc: { [key: string]: typeof birdsOfPrey }, bird) => {
    if (!acc[bird.family]) {
      acc[bird.family] = [];
    }
    acc[bird.family].push(bird);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {username}!</Text>
      {Object.entries(groupedBirds).map(([family, familyBirds]) => (
        <View key={family} style={styles.familyContainer}>
          <Text style={styles.familyTitle}>{family}</Text>
          {familyBirds.map((bird) => (
            <TouchableOpacity
              key={bird.id}
              style={styles.animalContainer}
              onPress={() => handleBirdSelect(bird)}
            >
              <Text style={styles.animalText}>
                {bird.name} ({bird.species})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  familyContainer: {
    marginBottom: 20,
  },
  familyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  animalContainer: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  animalText: {
    fontSize: 18,
    color: '#333',
  },
});
