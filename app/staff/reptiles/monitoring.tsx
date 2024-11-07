import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  StyleSheet,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import ToastManager, { Toast } from "toastify-react-native";

export default function ReptileRoomForm() {
  const { name, species, enclosure, keeper } = useLocalSearchParams();

  const showToast = () => {
    Toast.success(`Form Submitted Successfully!`);
  };

  const initialFormData = {
    keeper: "reptiles",
    date: "",
    temperature: "",
    humidity: "",
    health: "",
    foodOfferedQuantity: "",
    foodType: "",
    foodTaken: "",
    regurgitating: false,
    faeces: false,
    inBlue: false,
    shed: false,
    clean: false,
    urine: false,
    water: false,
    observation: "",
    animalName: name || "",
    species: species || "",
    enclosure: enclosure || "",
  };

  const [formData, setFormData] = useState(initialFormData);
  // console.log('Name:', name, 'Species:', species, 'Enclosure:', enclosure, 'Keeper:', keeper);

  useEffect(() => {
    if (name && species && enclosure) {
      setFormData((prevData) => ({
        ...prevData,
        animalName: name,
        species: species,
        enclosure: enclosure,
      }));
    }
  }, [name, species, enclosure]);

  useEffect(() => {
    const currentDate = new Date()
      .toLocaleDateString("en-GB")
      .split("/")
      .reverse()
      .join("-");
    setFormData((prevData) => ({ ...prevData, date: currentDate }));
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    console.log("Form Data Submitted:", formData);
    showToast();
    setFormData(initialFormData);
    setTimeout(() => {
      router.push("/staff/reptiles/");
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <ToastManager position="top" />
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>
          {formData.animalName} ({formData.species}) - Enclosure{" "}
          {formData.enclosure}
        </Text>
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Date</Text>
          <TextInput
            style={styles.input}
            value={formData.date}
            editable={false}
          />

          <Text style={styles.inputLabel}>Temperature °C</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Temperature"
            value={formData.temperature}
            onChangeText={(text) => handleInputChange("temperature", text)}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Humidity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Humidity"
            value={formData.humidity}
            onChangeText={(text) => handleInputChange("humidity", text)}
          />

          <Text style={styles.inputLabel}>Health</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Health Status"
            value={formData.health}
            onChangeText={(text) => handleInputChange("health", text)}
          />

          <Text style={styles.inputLabel}>Food Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter How much food was offered"
            value={formData.foodOfferedQuantity}
            onChangeText={(text) =>
              handleInputChange("foodOfferedQuantity", text)
            }
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Food Type</Text>
          <Picker
            selectedValue={formData.foodType}
            style={styles.input}
            onValueChange={(itemValue) =>
              handleInputChange("foodType", itemValue)
            }
          >
            <Picker.Item label="Chicks" value="chicks" />
            <Picker.Item label="Rats" value="rats" />
          </Picker>

          <Text style={styles.inputLabel}>Food Taken</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: formData.foodOfferedQuantity
                  ? "#fff"
                  : "#f0f0f0",
              },
            ]}
            placeholder="Enter Food Taken"
            value={formData.foodTaken}
            onChangeText={(text) => handleInputChange("foodTaken", text)}
            editable={!!formData.foodOfferedQuantity}
          />
          <BouncyCheckbox
            isChecked={formData.regurgitating}
            onPress={(isChecked: boolean) =>
              handleInputChange("regurgitating", isChecked)
            }
            fillColor="green"
            text="Regurgitating"
            iconStyle={{ borderColor: "green" }}
            innerIconStyle={{ borderWidth: 2 }}
          />

          <BouncyCheckbox
            isChecked={formData.faeces}
            onPress={(isChecked: boolean) =>
              handleInputChange("faeces", isChecked)
            }
            fillColor="green"
            text="Faeces"
            iconStyle={{ borderColor: "green" }}
            innerIconStyle={{ borderWidth: 2 }}
          />

          <BouncyCheckbox
            isChecked={formData.inBlue}
            onPress={(isChecked: boolean) =>
              handleInputChange("inBlue", isChecked)
            }
            fillColor="green"
            text="In Blue"
            iconStyle={{ borderColor: "green" }}
            innerIconStyle={{ borderWidth: 2 }}
          />

          <BouncyCheckbox
            isChecked={formData.shed}
            onPress={(isChecked: boolean) =>
              handleInputChange("shed", isChecked)
            }
            fillColor="green"
            text="Shedding"
            iconStyle={{ borderColor: "green" }}
            innerIconStyle={{ borderWidth: 2 }}
          />

          <BouncyCheckbox
            isChecked={formData.clean}
            onPress={(isChecked: boolean) =>
              handleInputChange("clean", isChecked)
            }
            fillColor="green"
            text="Clean"
            iconStyle={{ borderColor: "green" }}
            innerIconStyle={{ borderWidth: 2 }}
          />

          <BouncyCheckbox
            isChecked={formData.urine}
            onPress={(isChecked: boolean) =>
              handleInputChange("urine", isChecked)
            }
            fillColor="green"
            text="Urine"
            iconStyle={{ borderColor: "green" }}
            innerIconStyle={{ borderWidth: 2 }}
          />

          <BouncyCheckbox
            isChecked={formData.water}
            onPress={(isChecked: boolean) =>
              handleInputChange("water", isChecked)
            }
            fillColor="green"
            text="Water"
            iconStyle={{ borderColor: "green" }}
            innerIconStyle={{ borderWidth: 2 }}
          />

          <Text style={styles.inputLabel}>Observations / Life Support</Text>
          <TextInput
            style={styles.largeInput}
            placeholder="Enter Observations"
            value={formData.observation}
            onChangeText={(text) => handleInputChange("observation", text)}
            multiline
          />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  formSection: {
    backgroundColor: "white",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: "grey",
    marginTop: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  largeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: "#fff",
    height: 100,
    textAlignVertical: "top",
  },
});
