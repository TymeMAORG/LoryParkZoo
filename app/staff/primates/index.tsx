import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
} from "react-native";
import { ref, onValue, off } from "firebase/database";
import { database } from "../../../firebaseConfig";

interface Animal {
  id: string;
  name: string;
  species: string;
  age: string;
  sex: string;
  health: string;
  status: string;
  dateAdded: string;
}

export default function PrimatesHome() {
  const [animals, setAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    // Set up real-time listener
    const animalsRef = ref(database, 'animals');
    const unsubscribe = onValue(animalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const primatesArray = Object.entries(data)
          .map(([id, animal]: [string, any]) => ({
            id,
            ...animal
          }))
          .filter(animal => animal.section === "Primates");
        
        setAnimals(primatesArray);
      } else {
        setAnimals([]); // Reset to empty array if no data exists
      }
    }, (error) => {
      console.error("Error fetching primates:", error);
    });

    // Cleanup function to remove listener when component unmounts
    return () => {
      off(animalsRef);
    };
  }, []); // Empty dependency array since we want this to run once on mount

  const renderAnimalCard = ({ item }: { item: Animal }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={[styles.statusBadge, 
          { backgroundColor: item.status === 'Alive' ? '#2ecc71' : '#e74c3c' }
        ]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardText}>Species: {item.species}</Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDetails: {
    gap: 5,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  healthStatus: {
    fontSize: 14,
    color: "#666",
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
