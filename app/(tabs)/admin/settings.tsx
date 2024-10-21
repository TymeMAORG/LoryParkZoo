import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";

export default function AdminSettings() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace("/");
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Settings</Text>
      {/* Future admin settings here */}

      {/* Account Section */}
      <Text style={styles.accountLabel}>Account</Text>
      <View style={styles.accountSection}>
        <Text style={styles.accountDescription}>
          Manage your account settings and log out when you're finished.
        </Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
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
    fontWeight: "bold",
  },
  accountSection: {
    backgroundColor: "white",
    //marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  accountLabel: {
    fontSize: 16,
    color: "grey",
    marginTop: 14,
    fontWeight: "bold",
    marginBottom: 8,
    marginStart: 8,
  },
  accountDescription: {
    marginVertical: 8,
    fontSize: 16,
    color: "#555",
  },
});
