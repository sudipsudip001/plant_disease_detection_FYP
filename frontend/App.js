import React, { useRef, useState } from "react";
import {
  ScrollView,
  View,
  Button,
  Image,
  Text,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import axios from "axios";

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

  let val;
  if (Platform.OS === "android") {
    val = "http://192.168.1.66:8000"; // change this ip address according to your device's ip address
  } else {
    val = "http://localhost:8000";
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

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

  const retakePicture = () => {
    setCapturedImage(null);
    setCameraActive(true);
    setCurrentView("camera");
  };

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

  //module for uploading image using camera
  const uploadPhoto = async () => {
    const formData = new FormData();
    formData.append("file", {
      uri: capturedImage,
      type: "image/jpeg",
      name: "photo.jpg",
    });
    try {
      const response = await axios.post(`${val}/predict/${selectedPlant}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPrediction(response.data);
    } catch (error) {
      console.log("There was an error: ", error);
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

  const renderView = () => {
    switch (currentView) {
      case "home":
        return (
          <View>
            <Button title="File" onPress={() => setCurrentView("upload")} />
            <Button
              title="Camera"
              onPress={() => {
                setCurrentView("camera");
                setCameraActive(true);
              }}
            />
            <Button title="check endpoint" onPress={statsCheck} />
            {stats && (
              <View>
                <Text>status: {stats.data.status}</Text>
              </View>
            )}
          </View>
        );
      case "upload":
        return (
          <View>
            <Button title="Select Image" onPress={selectImage} />
            <Picker
              selectedValue={selectedPlant}
              style={{ height: 50, width: 150 }}
              onValueChange={(itemValue) => setSelectedPlant(itemValue)}
            >
              <Picker.Item label="Potato" value="potato" />
              <Picker.Item label="Tomato" value="tomato" />
              <Picker.Item label="Pepper" value="pepper" />
            </Picker>
            {imageUri && (
              <Image
                source={{ uri: imageUri.uri }}
                style={{ width: 200, height: 200, marginVertical: 20 }}
              />
            )}
            <Button title="Predict" onPress={uploadImage} />
            {prediction && (
              <View>
                <Text>Prediction: {prediction.predicted_class}</Text>
                <Text>Confidence: {prediction.confidence.toFixed(2)}</Text>
                <Button title="Detailed explanation" onPress={()=> setCurrentView("detailedExplanation")}/>
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
                <Text>Prediction: {prediction.predicted_class}</Text>
                <Text>Confidence: {prediction.confidence.toFixed(2)}</Text>
                <Button title="Detailed explanation" onPress={() => setCurrentView("detailedExplanation")}/>
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
          </View>
        );
      case "detailedExplanation":
        return (
          <ScrollView style={{
            width: Dimensions.get("window").width - 80,
            height: Dimensions.get("window").height - 400,
            marginVertical: 20,
          }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <Text>Suggestions ahead:</Text>
            <Text>{prediction.steps_ahead}</Text>
            <Button
              title="Home"
              onPress={() => {
                setCurrentView("home");
                setImageUri(null);
                setPrediction(null);
              }}
            />
          </ScrollView>
          
        )
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {renderView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 200,
  },
  buttonContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 16,
  },
  button: {
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 10,
  },
  captureButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 15,
    paddingHorizontal: 30,
  },
  captureButtonText: {
    color: "black",
    fontSize: 18,
  },
});

export default App;
