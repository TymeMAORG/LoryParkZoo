import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function BigCatDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock data - replace with actual data fetching
  const bigCat = {
    id,
    name: 'Leo',
    species: 'Lion',
    age: 5,
    weight: '190kg',
    diet: 'Carnivore',
    habitat: 'Savanna Enclosure',
    medicalHistory: 'Annual checkup completed last month',
    notes: 'Friendly disposition, good with handlers',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.header}>{bigCat.name}</Text>
        <Text style={styles.subHeader}>{bigCat.species}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Age:</Text>
        <Text style={styles.value}>{bigCat.age} years</Text>

        <Text style={styles.label}>Weight:</Text>
        <Text style={styles.value}>{bigCat.weight}</Text>

        <Text style={styles.label}>Diet:</Text>
        <Text style={styles.value}>{bigCat.diet}</Text>

        <Text style={styles.label}>Habitat:</Text>
        <Text style={styles.value}>{bigCat.habitat}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical History</Text>
        <Text style={styles.value}>{bigCat.medicalHistory}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.value}>{bigCat.notes}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 8,
  },
}); 