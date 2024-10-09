import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BirdsHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Home</Text>
      {/*ToDo: add Staff home content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
