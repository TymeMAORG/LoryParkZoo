import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../firebaseConfig';

interface ActivityItem {
  timestamp: string;
  animalName: string;
  type: string;
  section: string;
}

export default function AdminDashboard() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Create refs for each section's records
    const primatesRef = ref(database, `Primates Feeding Records/${today}`);
    const reptilesRef = ref(database, `Reptiles Monitoring Records/${today}`);
    const bigcatsRef = ref(database, `BigCats FoodMonitoring Sheet/${today}`);
    
    const handleData = (snapshot: any, section: string, type: string) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([animalName, records]: [string, any]) => ({
          timestamp: records.timestamp || records[Object.keys(records)[0]]?.timestamp,
          animalName,
          type,
          section
        }));
      }
      return [];
    };

    const unsubscribePrimates = onValue(primatesRef, (snapshot) => {
      const primateActivities = handleData(snapshot, 'Primates', 'Feeding');
      updateActivities(primateActivities);
    });

    const unsubscribeReptiles = onValue(reptilesRef, (snapshot) => {
      const reptileActivities = handleData(snapshot, 'Reptiles', 'Monitoring');
      updateActivities(reptileActivities);
    });

    const unsubscribeBigcats = onValue(bigcatsRef, (snapshot) => {
      const bigcatActivities = handleData(snapshot, 'BigCats', 'Food Monitoring');
      updateActivities(bigcatActivities);
    });

    return () => {
      off(primatesRef);
      off(reptilesRef);
      off(bigcatsRef);
    };
  }, []);

  const updateActivities = (newActivities: ActivityItem[]) => {
    setActivities(current => {
      const combined = [...current, ...newActivities];
      // Remove duplicates and sort by timestamp
      const unique = Array.from(new Map(
        combined.map(item => [item.animalName + item.section, item])
      ).values());
      return unique.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
  };

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.section) {
      case 'Primates':
        return `Feeding form submitted for ${activity.animalName}`;
      case 'Reptiles':
        return `Enclosure monitoring form submitted for ${activity.animalName}`;
      case 'BigCats':
        return `Food monitoring form submitted for ${activity.animalName}`;
      default:
        return '';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'Primates':
        return '#4CAF50';
      case 'Reptiles':
        return '#2196F3';
      case 'BigCats':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Today's Activity</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      <View style={styles.activityContainer}>
        {activities.length === 0 ? (
          <View style={styles.noActivityContainer}>
            <Text style={styles.noActivityText}>No activity recorded today</Text>
          </View>
        ) : (
          activities.map((activity, index) => (
            <View 
              key={`${activity.animalName}-${activity.section}-${index}`} 
              style={styles.activityItem}
            >
              <View style={[
                styles.sectionIndicator,
                { backgroundColor: getSectionColor(activity.section) }
              ]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  {getActivityMessage(activity)}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTime(activity.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  activityContainer: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionIndicator: {
    width: 4,
    backgroundColor: '#4CAF50',
  },
  activityContent: {
    flex: 1,
    padding: 16,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  noActivityContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  noActivityText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 