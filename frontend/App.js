import React, { useState } from "react";
import { View, Button, Image, Text, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";

const App = () => {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState("potato");

  let val;
  if (Platform.OS === "android") {
    val = "http://192.168.1.68:8000"; // change this ip address according to your device's ip address
  } else {
    val = "http://localhost:8000";
  }

  const statsCheck = async () => {
    try {
      const response = await axios.get(val);
      setStats(response);
    } catch (error) {
      console.log("Error checking endpoint:", error.message);
    }
  };

  const selectImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access media library is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true, // set to false to remove editing options
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0]);
      } else {
        console.log("Image selection canceled");
      }
    } catch (error) {
      console.error("Error selecting image:", error.message);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) {
      console.error("Image URI is not set");
      return;
    }

    if (Platform.OS === "android") {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri.uri,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      final = `${val}/predict/${selectedPlant}`; // note that '/' at the end of the url can cause errors.
      try {
        const response = await axios.post(final, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setPrediction(response.data);
      } catch (error) {
        console.log("There was an error.", error);
      }
    } else {
      try {
        final = `${val}/predict/${selectedPlant}`;
        const formData = new FormData();
        const base64Response = await fetch(imageUri.uri);
        const blob = await base64Response.blob();
        formData.append("file", blob, "uploaded_image.jpg");

        const response = await axios.post(final, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000,
        });
        setPrediction(response.data);
      } catch (error) {
        console.log("error");
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Select Image" onPress={selectImage} />
      {imageUri && (
        <Image
          source={{ uri: imageUri.uri }}
          style={{ width: 200, height: 200, marginVertical: 20 }}
        />
      )}
      <Button title="Upload and Predict" onPress={uploadImage} />
      {prediction && (
        <View>
          <Text>Prediction: {prediction.predicted_class}</Text>
          <Text>Confidence: {prediction.confidence.toFixed(2)}</Text>
        </View>
      )}
      <Button title="check endpoint" onPress={statsCheck} />
      {stats && (
        <View>
          <Text>status: {stats.data.status}</Text>
        </View>
      )}

      <Picker
        selectedValue={selectedPlant}
        style={{ height: 50, width: 150 }}
        onValueChange={(itemValue) => setSelectedPlant(itemValue)}
      >
        <Picker.Item label="Potato" value="potato" />
        <Picker.Item label="Tomato" value="tomato" />
        <Picker.Item label="Pepper" value="pepper" />
      </Picker>
    </View>
  );
};

export default App;
