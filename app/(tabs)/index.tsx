import { View, Text, StyleSheet } from 'react-native';
import { useUserStore } from '../index';

export default function Dashboard() {
  const { username, section } = useUserStore();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {username}!</Text>
      <Text style={styles.section}>Section: {section}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    fontSize: 18,
    color: '#666',
  },
});
