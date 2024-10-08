// /app/(tabs)/admin/index.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminDashboard() {
  
  const getFormattedDate = () => {
    const date = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = daysOfWeek[date.getDay()];
    const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthsOfYear[date.getMonth()];
    const dayOfMonth = date.getDate().toString().padStart(2, '0');
    
    return `${day}, ${month} ${dayOfMonth}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.date}>{getFormattedDate()}</Text>
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
  date: {
    fontSize: 18,
    marginTop: 8,
  },
});
