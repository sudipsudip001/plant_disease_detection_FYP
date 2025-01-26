import React from "react";
import { View, Button, Text, ActivityIndicator, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { pickerStyle } from "../../styles/styles";

const Uploaded = ({
  prediction,
  selectedPlant,
  imageUri,
  setSelectedPlant,
  setPrediction,
  uploadImage,
  setImageUri,
  promptTheLLM,
  setCurrentView,
  isLoading,
  selectImage,
}) => {
  return (
    <View style={pickerStyle.container}>
      <Button title="Select Image" onPress={selectImage} />
      <Picker
        selectedValue={selectedPlant}
        style={pickerStyle.picker}
        onValueChange={(itemValue) => setSelectedPlant(itemValue)}
      >
        <Picker.Item label="Potato" value="potato" />
        <Picker.Item label="Tomato" value="tomato" />
        <Picker.Item label="Pepper" value="pepper" />
      </Picker>
      {imageUri && (
        <Image source={{ uri: imageUri.uri }} style={pickerStyle.image} />
      )}
      <Button title="Predict" onPress={uploadImage} />
      {prediction && (
        <View style={pickerStyle.predictionContainer}>
          <Text style={pickerStyle.predictionText}>
            {prediction.predicted_class ===
            "Please input the image of a leaf" ? (
              <Text>{prediction.predicted_class}</Text>
            ) : (
              <Text>Prediction: {prediction.predicted_class}</Text>
            )}
          </Text>
          <Text style={pickerStyle.predictionText}>
            {prediction.confidence && (
              <Text>Confidence: {prediction?.confidence?.toFixed(2)}</Text>
            )}
          </Text>
          {prediction.predicted_class === "Please input the image of a leaf" ? (
            <></>
          ) : (
            <Button
              title="Details"
              onPress={() => setCurrentView("detailedDescription")}
            />
          )}
        </View>
      )}
      <Button
        title="Home"
        onPress={() => {
          setCurrentView("home");
          setImageUri(null);
          setPrediction(null);
        }}
        style={pickerStyle.button}
      />
      {isLoading && (
        <View style={pickerStyle.loading}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

export default Uploaded;
