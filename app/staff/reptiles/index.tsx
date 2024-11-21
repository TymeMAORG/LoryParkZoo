import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
} from "react-native";
import { ref, onValue, off } from "firebase/database";
import { database } from "../../../firebaseConfig";

interface Reptile {
  id: string;
  name: string;
  species: string;
  enclosure: string;
  family: string;
  health: string;
  status: string;
  dateAdded: string;
}

export default function ReptilesHome() {
  const [reptiles, setReptiles] = useState<Reptile[]>([]);

  useEffect(() => {
    const reptilesRef = ref(database, 'animals');
    
    const unsubscribe = onValue(reptilesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reptilesArray = Object.entries(data)
          .map(([id, animal]: [string, any]) => ({
            id,
            ...animal
          }))
          .filter(animal => animal.section === "Reptiles");
        
        setReptiles(reptilesArray);
      } else {
        setReptiles([]);
      }
    });

    return () => off(reptilesRef);
  }, []);

  const renderReptileCard = ({ item }: { item: Reptile }) => (
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
        <Text style={styles.cardText}>Enclosure: {item.enclosure}</Text>
        <Text style={styles.cardText}>Family: {item.family}</Text>
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
        data={reptiles}
        renderItem={renderReptileCard}
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
