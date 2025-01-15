import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  Button,
  Image,
  Text,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import axios from "axios";
import {
  styles,
  pickerStyle,
  homeStyle,
  permissionStyle,
} from "../styles/styles";
import Icon from "react-native-vector-icons/FontAwesome";

const App = () => {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState("potato");

  // to change views efficiently
  const [currentView, setCurrentView] = useState("home");

  // for camera
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState("back");
  const [cameraActive, setCameraActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);

  //for LLM response
  const [LLMResponse, setLLMResponse] = useState(null);

  //loading stuff
  const [isLoading, setIsLoading] = useState(false);

  let val;
  if (Platform.OS === "android") {
    val = "http://192.168.1.66:8000"; // change this ip address according to your device's ip address
  } else {
    val = "http://localhost:8000";
  }

  //this function is imported from utils.js
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={permissionStyle.container}>
        <Text style={permissionStyle.message}>
          We need your permission to open the camera⚠️
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // function to take picture
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: false,
          quality: 0.5,
          skipProcessing: true,
          shutterSound: false,
        });
        setCurrentView("cameraCapture");
        setCameraActive(false);
        setCapturedImage(photo.uri);
      } catch (error) {
        console.log("Failed to take picture: ", error);
      }
    }
  };

  //function to retake picture
  const retakePicture = () => {
    setCapturedImage(null);
    setCameraActive(true);
    setCurrentView("camera");
  };

  //function to check the status
  const statsCheck = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(val);
      setStats(response);
    } catch (error) {
      console.log("Error checking endpoint:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  //function to promplt the LLM
  const promptTheLLM = async (plant, disease) => {
    setIsLoading(true);
    try {
      const data = {
        plant: plant,
        disease: disease,
      };
      const response = await axios.post(`${val}/chat`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setLLMResponse(response.data);
      setCurrentView("detailedDescription");
    } catch (error) {
      console.error("There was an error in the process: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  //function to select the image
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

  //function for uploading image using camera
  const uploadPhoto = async () => {
    const formData = new FormData();
    formData.append("file", {
      uri: capturedImage,
      type: "image/jpeg",
      name: "photo.jpg",
    });
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${val}/predict/${selectedPlant}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPrediction(response.data);
    } catch (error) {
      try {
        const response = await axios.post(
          `${val}/predict/${selectedPlant}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setPrediction(response.data);
      } catch (error) {
        console.log(`${val}/predict/${selectedPlant}`);
        console.log("There was an error: ", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  //image upload and predict function
  const uploadImage = async () => {
    if (!imageUri) {
      console.error("Image URI is not set");
      return;
    }

    final = `${val}/predict/${selectedPlant}`; // note that '/' at the end of the url can cause errors.
    if (Platform.OS === "android") {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri.uri,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      setIsLoading(true);
      try {
        const response = await axios.post(final, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setPrediction(response.data);
      } catch (error) {
        //repeated the block due to error in the first try of requesting the URL
        try {
          const response = await axios.post(final, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          setPrediction(response.data);
        } catch (error) {
          console.error("Full error object: ", error);
          console.error("Error name: ", error.name);
          console.error("Error code: ", error.code);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "home":
        return (
          <View style={homeStyle.container}>
            <TouchableOpacity
              style={homeStyle.button}
              onPress={() => setCurrentView("upload")}
            >
              <Icon name="file" size={18} color="white" />
              <Text style={homeStyle.buttonText}>File </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyle.button}
              onPress={() => {
                setCurrentView("camera");
                setCameraActive(true);
              }}
            >
              <Icon name="camera" size={20} color="white" />
              <Text style={homeStyle.buttonText}> Camera </Text>
            </TouchableOpacity>
            <TouchableOpacity style={homeStyle.button} onPress={statsCheck}>
              <Text style={homeStyle.buttonText}>Check Endpoint</Text>
            </TouchableOpacity>
            {stats && (
              <View style={homeStyle.statusContainer}>
                <Text style={homeStyle.statusText}>
                  Status: {stats.data.status}
                </Text>
              </View>
            )}
          </View>
        );
      case "upload":
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
                  Prediction: {prediction.predicted_class}
                </Text>
                <Text style={pickerStyle.predictionText}>
                  {prediction.confidence && (
                    <Text>
                      Confidence: {prediction?.confidence?.toFixed(2)}
                    </Text>
                  )}
                </Text>
                <Button
                  title="Details"
                  onPress={() =>
                    promptTheLLM(selectedPlant, prediction.predicted_class)
                  }
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
              style={pickerStyle.button}
            />
            {isLoading && (
              <View style={styles.loading}>
                <ActivityIndicator size="large" />
              </View>
            )}
          </View>
        );
      case "camera":
        return (
          <View style={styles.container}>
            <CameraView
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
              contentFit="cover"
            >
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={toggleCameraFacing}
                >
                  <Text style={styles.text}>Flip Camera</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.captureButtonContainer}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <Text style={styles.captureButtonText}>Capture</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
            <Button
              title="Home"
              onPress={() => {
                setCurrentView("home");
                setImageUri(null);
                setPrediction(null);
              }}
            />
          </View>
        );
      case "cameraCapture":
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
                    promptTheLLM(selectedPlant, prediction.predicted_class);
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
      case "detailedDescription":
        return (
          <ScrollView>
            <Text>Steps ahead:</Text>
            <Text>{LLMResponse}</Text>
            <Button
              title="Home"
              onPress={() => {
                setCurrentView("home");
                setImageUri(null);
                setPrediction(null);
              }}
            />
          </ScrollView>
        );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {renderView()}
    </View>
  );
};

export default App;
