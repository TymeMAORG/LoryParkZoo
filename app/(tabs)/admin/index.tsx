import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminDashboard() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      {/* ToDo: Add admin dashboard content here */}
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
