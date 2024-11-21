import React, { useState, useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Task = { id: string; text: string };
type TasksState = {
  todo: Task[];
  doing: Task[];
  done: Task[];
};

export default function TaskManagement() {
  const [taskText, setTaskText] = useState("");
  const [tasks, setTasks] = useState<TasksState>({
    todo: [],
    doing: [],
    done: [],
  });
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set the current date
  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);
  }, []);

  const saveTasksToStorage = async (date: string, tasks: TasksState) => {
    try {
      const key = `bigcats_tasks_${date}`;
      await AsyncStorage.setItem(key, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const loadTasksFromStorage = async (date: string): Promise<TasksState | null> => {
    try {
      const key = `bigcats_tasks_${date}`;
      const savedTasks = await AsyncStorage.getItem(key);
      return savedTasks ? JSON.parse(savedTasks) : null;
    } catch (error) {
      console.error('Error loading tasks:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadTodayData = async () => {
      setIsLoading(true);
      try {
        const savedTasks = await loadTasksFromStorage(currentDate);
        if (savedTasks) {
          setTasks(savedTasks);
        }
      } catch (error) {
        setError("Failed to load today's tasks");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentDate) {
      loadTodayData();
    }
  }, [currentDate]);

  const addTask = async () => {
    if (taskText.trim()) {
      const newTasks = {
        ...tasks,
        todo: [...tasks.todo, { id: Date.now().toString(), text: taskText }],
      };
      setTasks(newTasks);
      await saveTasksToStorage(currentDate, newTasks);
      setTaskText("");
    }
  };

  const moveTask = async (task: Task, from: keyof TasksState, to: keyof TasksState) => {
    const newTasks = {
      ...tasks,
      [from]: tasks[from].filter((t) => t.id !== task.id),
      [to]: [...tasks[to], task],
    };
    setTasks(newTasks);
    await saveTasksToStorage(currentDate, newTasks);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Task Management</Text>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Task Management Sections */}
        <View style={styles.taskContainer}>
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
    height: 40,
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
    backgroundColor: "#3498db",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: "20%",
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
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  }
});