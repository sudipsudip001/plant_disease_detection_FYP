import React from "react";
import {
  View,
  Image,
  Dimensions,
  Button,
  ActivityIndicator,
  Text,
} from "react-native";
import { styles } from "../../styles/styles";
import { Picker } from "@react-native-picker/picker";

function CaptureCamera({
  prediction,
  imageUri,
  setImageUri,
  uploadPhoto,
  retakePicture,
  capturedImage,
  selectedPlant,
  setSelectedPlant,
  setPrediction,
  isLoading,
  setCurrentView,
  promptTheLLM,
}) {
  return (
    <View>
      <Image source={{ uri: imageUri }} resizeMode="contain" />
      <Button title="Predict" onPress={uploadPhoto} />
      <Button title="Retake" onPress={retakePicture} />
      {capturedImage && (
        <Image
          source={{ uri: capturedImage }}
          style={{
            width: Dimensions.get("window").width - 80,
            height: Dimensions.get("window").height - 400,
            marginVertical: 20,
          }}
        />
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
      {prediction && (
        <View>
          <Text>Prediction: {prediction?.predicted_class}</Text>
          {prediction.confidence && (
            <Text>
              <Text>Confidence: {prediction?.confidence.toFixed(2)}</Text>
            </Text>
          )}
          <Button
            title="Details"
            onPress={() => {
              setCurrentView("detailedDescription");
            }}
          />
        </View>
      )}
      <Button
        title="Home"
        onPress={() => {
          setCurrentView("home");
          setImageUri(null);
          setPrediction(null);
        }}
      />
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

export default CaptureCamera;
