import React, { useState, useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { ref, push, set, get } from "firebase/database";
import { database } from "../../../firebaseConfig"; // Update with your Firebase config

// Define task type
type Task = { id: string; text: string };
type TasksState = {
  todo: Task[];
  doing: Task[];
  done: Task[];
};

export default function BigCatsHome() {
  const [temperature, setTemperature] = useState(""); // State for temperature input
  const [taskText, setTaskText] = useState(""); // State for task input text
  const [tasks, setTasks] = useState<TasksState>({
    todo: [],
    doing: [],
    done: [],
  });
  const [currentDate, setCurrentDate] = useState<string>("");

  // Set the current date
  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]); // Format date as YYYY-MM-DD
  }, []);

  // Handle adding a new task to "To Do"
  const addTask = () => {
    if (taskText.trim()) {
      setTasks((prevTasks) => ({
        ...prevTasks,
        todo: [...prevTasks.todo, { id: Date.now().toString(), text: taskText }],
      }));
      setTaskText(""); // Clear input field
    }
  };

  // Handle moving a task between sections
  const moveTask = (task: Task, from: keyof TasksState, to: keyof TasksState) => {
    setTasks((prevTasks) => {
      const newFrom = prevTasks[from].filter((t) => t.id !== task.id);
      const newTo = [...prevTasks[to], task];
      return { ...prevTasks, [from]: newFrom, [to]: newTo };
    });
  };

  // Save temperature and tasks to Firebase with the date as the key
  const saveDataToFirebase = async () => {
    try {
      const newRecordRef = ref(database, `BigCats Index Form/${currentDate}`); // Use date as the key
      await set(newRecordRef, {
        temperature: temperature,
        tasks: tasks,
      });

      Alert.alert("Success", "Data saved to Firebase!");
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      Alert.alert("Error", "Failed to save data.");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Big Cats Home</Text>

        {/* Temperature Input */}
        <View style={styles.temperatureContainer}>
          <Text style={styles.subtitle}>Enter Temperature (°C):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 25"
            value={temperature}
            onChangeText={(text) => setTemperature(text)}
          />
        </View>

        {/* Task Management Sections */}
        <View style={styles.taskContainer}>
          <Text style={styles.subtitle}>Task Management</Text>

          {/* Add Task Input */}
          <View style={styles.addTaskContainer}>
            <TextInput
              style={[styles.input, styles.taskInput]}
              placeholder="Enter a task"
              value={taskText}
              onChangeText={(text) => setTaskText(text)}
            />
            <TouchableOpacity style={[styles.addButton, styles.taskInput]} onPress={addTask}>
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>

          {/* Task Sections */}
          <View style={styles.sectionsContainer}>
            {(["todo", "doing", "done"] as Array<keyof TasksState>).map((section) => (
              <View key={section} style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    section === "todo" && styles.todoTitle,
                    section === "doing" && styles.doingTitle,
                    section === "done" && styles.doneTitle,
                  ]}
                >
                  {section.toUpperCase()}
                </Text>
                <View style={styles.sectionBorder}>
                  <DraggableFlatList
                    data={tasks[section]}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, drag }: RenderItemParams<Task>) => (
                      <TouchableOpacity
                        style={styles.taskItem}
                        onLongPress={drag}
                        onPress={() => {
                          const nextSection =
                            section === "todo"
                              ? "doing"
                              : section === "doing"
                              ? "done"
                              : "todo";
                          moveTask(item, section, nextSection);
                        }}
                      >
                        <Text>{item.text}</Text>
                      </TouchableOpacity>
                    )}
                    onDragEnd={({ data }) =>
                      setTasks((prevTasks) => ({ ...prevTasks, [section]: data }))
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveDataToFirebase}>
          <Text style={styles.buttonText}>Save Data</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
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
    marginBottom: 16,
  },
  temperatureContainer: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
  },
  taskInput: {
    flex: 1,
    height: 40, // Ensures both input and button have the same height
  },
  taskContainer: {
    flex: 1,
  },
  addTaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: "20%", // Matches the width and height of input field
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionBorder: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 8,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  todoTitle: {
    color: "red",
  },
  doingTitle: {
    color: "orange",
  },
  doneTitle: {
    color: "green",
  },
  taskItem: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 4,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
});
