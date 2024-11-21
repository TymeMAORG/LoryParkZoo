// /app/(tabs)/staff/animalgroup/birdsofprey/index.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ref, onValue, off } from "firebase/database";
import { database } from "../../../firebaseConfig";

interface Bird {
  id: string;
  name: string;
  species: string;
  family: string;
  health: string;
  status: string;
  dateAdded: string;
}

export default function BirdsOfPreyHome() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const [birds, setBirds] = useState<Bird[]>([]);

  useEffect(() => {
    const birdsRef = ref(database, 'animals');
    
    const unsubscribe = onValue(birdsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const birdsArray = Object.entries(data)
          .map(([id, animal]: [string, any]) => ({
            id,
            ...animal
          }))
          .filter(animal => animal.section === "BirdsOfPrey");
        
        setBirds(birdsArray);
      } else {
        setBirds([]);
      }
    });

    return () => off(birdsRef);
  }, []);

  const renderBirdCard = ({ item: bird }: { item: Bird }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push("/staff/birdsofprey/foodmonitoring")}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{bird.name}</Text>
        <Text style={[styles.statusBadge, 
          { backgroundColor: bird.status === 'Alive' ? '#2ecc71' : '#e74c3c' }
        ]}>
          {bird.status}
        </Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardText}>Species: {bird.species}</Text>
        <Text style={styles.cardText}>Family: {bird.family}</Text>
        <Text style={[
          styles.healthStatus,
          bird.health === 'Healthy' && styles.healthyStatus,
          bird.health === 'Unhealthy/Ill' && styles.unhealthyStatus,
          bird.health === 'Convalescing' && styles.convalescingStatus,
        ]}>
          Health: {bird.health}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFamilySection = ({ item: family }: { item: string }) => {
    const familyBirds = birds.filter(bird => bird.family === family);
    
    return (
      <View style={styles.familySection}>
        <Text style={styles.familyTitle}>{family}</Text>
        <FlatList
          data={familyBirds}
          renderItem={renderBirdCard}
          keyExtractor={(bird) => bird.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const uniqueFamilies = [...new Set(birds.map(bird => bird.family))];

  return (
    <View style={styles.container}>
      <FlatList
        data={uniqueFamilies}
        renderItem={renderFamilySection}
        keyExtractor={(family) => family}
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
  familySection: {
    marginBottom: 20,
  },
  familyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
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
