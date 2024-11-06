import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUserStore } from '../index';

export default function AdminDashboard() {
  const { username } = useUserStore();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Welcome Admin, {username}!</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>15</Text>
          <Text style={styles.statLabel}>Total Staff</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>45</Text>
          <Text style={styles.statLabel}>Animals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Sections</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityList}>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>Sarah submitted daily checklist</Text>
          <Text style={styles.activityTime}>2 hours ago</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>John updated feeding schedule</Text>
          <Text style={styles.activityTime}>4 hours ago</Text>
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  activityItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityText: {
    fontSize: 16,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
}); 