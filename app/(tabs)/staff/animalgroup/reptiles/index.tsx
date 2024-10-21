import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";

const animals = [
  {
    id: 1,
    name: "Petunia",
    species: "Red Tailed Boa",
    enclosure: "RR2",
    family: "Boidae",
  },
  {
    id: 2,
    name: "Pascal",
    species: "Flap necked chameleon",
    enclosure: "A1",
    family: "Chamaeleonidae",
  },
  {
    id: 3,
    name: "Spike",
    species: "Bearded Dragon",
    enclosure: "A2",
    family: "Agamidae",
  },
  {
    id: 4,
    name: "Godzilla",
    species: "Green Iguana",
    enclosure: "A3",
    family: "Iguanidae",
  },
  {
    id: 5,
    name: "Morelia",
    species: "Carpet Python",
    enclosure: "RR1",
    family: "Pythonidae",
  },
  {
    id: 6,
    name: "Lucy",
    species: "Reticulated Python",
    enclosure: "RR3",
    family: "Pythonidae",
  },
];

export default function ReptilesHome() {
  const router = useRouter();
  const { username } = useLocalSearchParams();

  const handleAnimalSelect = (animal: {
    id?: React.Key | null | undefined;
    name: any;
    species: any;
    enclosure: any;
  }) => {
    router.push({
      pathname: "/staff/animalgroup/reptiles/monitoring",
      params: {
        name: animal.name,
        species: animal.species,
        enclosure: animal.enclosure,
        keeper: username,
      },
    });
  };

  const groupedAnimals = animals.reduce(
    (acc: { [key: string]: typeof animals }, animal) => {
      if (!acc[animal.family]) {
        acc[animal.family] = [];
      }
      acc[animal.family].push(animal);
      return acc;
    },
    {},
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {username}!</Text>
      {Object.entries(groupedAnimals).map(([family, familyAnimals]) => (
        <View key={family} style={styles.familyContainer}>
          <Text style={styles.familyTitle}>{family}</Text>
          {familyAnimals.map(
            (animal: {
              id: React.Key | null | undefined;
              name:
                | string
                | number
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | null
                | undefined;
              species:
                | string
                | number
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | null
                | undefined;
              enclosure:
                | string
                | number
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | null
                | undefined;
            }) => (
              <TouchableOpacity
                key={animal.id}
                style={styles.animalContainer}
                onPress={() => handleAnimalSelect(animal)}
              >
                <Text style={styles.animalText}>
                  {animal.name} ({animal.species}) - Enclosure{" "}
                  {animal.enclosure}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  familyContainer: {
    marginBottom: 20,
  },
  familyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  animalContainer: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
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
    color: "#333",
  },
});
