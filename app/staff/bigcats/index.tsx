import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

interface BigCat {
  id: string;
  name: string;
  species: string;
  age: number;
}

// Mock data - replace with actual data fetching
const mockBigCats: BigCat[] = [
  { id: '1', name: 'Leo', species: 'Lion', age: 5 },
  { id: '2', name: 'Tiger', species: 'Bengal Tiger', age: 3 },
];

export default function BigCatsIndex() {
  const router = useRouter();

  const renderItem = ({ item }: { item: BigCat }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`staff/bigcats/details?id=${item.id}` as any)}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.species}>{item.species}</Text>
      <Text>Age: {item.age} years</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockBigCats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  species: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
}); 