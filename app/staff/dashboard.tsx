import { View, Text, StyleSheet } from 'react-native';
import { useUserStore } from '../index';

export default function StaffDashboard() {
  const { username, section } = useUserStore();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {username}!</Text>
      <Text style={styles.section}>Section: {section}</Text>
      
      <View style={styles.tasksContainer}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Daily Checklist</Text>
          <Text style={styles.taskStatus}>Pending</Text>
        </View>
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Food Monitoring</Text>
          <Text style={styles.taskStatus}>Pending</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  tasksContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskTitle: {
    fontSize: 16,
  },
  taskStatus: {
    color: '#FF9800',
    fontWeight: '500',
  },
}); 