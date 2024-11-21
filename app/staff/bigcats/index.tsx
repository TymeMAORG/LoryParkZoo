import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
} from "react-native";
import { database } from "../../../firebaseConfig";
import { ref, onValue, off, DataSnapshot } from "firebase/database";

interface Animal {
  id: string;
  name: string;
  species: string;
  coatPattern: string;
  age: string;
  sex: string;
  health: string;
  status: string;
  dateAdded: string;
}

export default function BigCatsHome() {
  const [animals, setAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    const animalsRef = ref(database, 'animals');
    console.log('Setting up real-time listener for BigCats');
    
    const unsubscribe = onValue(animalsRef, (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Received data:', data);
        
        const bigCatsArray = Object.entries(data)
          .map(([id, animal]: [string, any]) => ({
            id,
            ...animal
          }))
          .filter(animal => {
            console.log('Checking animal:', animal);
            return animal.section === "BigCats";
          });
        
        console.log('Filtered BigCats:', bigCatsArray);
        setAnimals(bigCatsArray);
      } else {
        console.log('No data in snapshot');
        setAnimals([]);
      }
    }, (error: Error) => {
      console.error('Error in real-time listener:', error);
    });

    return () => {
      console.log('Cleaning up listener');
      off(animalsRef);
    };
  }, []);

  const renderAnimalCard = ({ item }: { item: Animal }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.cardActions}>
          <Text style={[styles.statusBadge, 
            { backgroundColor: item.status === 'Alive' ? '#2ecc71' : '#e74c3c' }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardText}>Species: {item.species}</Text>
        <Text style={styles.cardText}>Coat/Pattern: {item.coatPattern}</Text>
        <Text style={styles.cardText}>Age: {item.age}</Text>
        <Text style={styles.cardText}>Sex: {item.sex}</Text>
        <Text style={[
          styles.healthStatus,
          item.health === 'Healthy' && styles.healthyStatus,
          item.health === 'Unhealthy/Ill' && styles.unhealthyStatus,
          item.health === 'Convalescing' && styles.convalescingStatus,
        ]}>
          Health: {item.health}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={animals}
        renderItem={renderAnimalCard}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDetails: {
    gap: 5,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  healthStatus: {
    padding: 5,
    borderRadius: 5,
  },
  healthyStatus: {
    backgroundColor: '#2ecc7133',
  },
  unhealthyStatus: {
    backgroundColor: '#e74c3c33',
  },
  convalescingStatus: {
    backgroundColor: '#f1c40f33',
  },
});
