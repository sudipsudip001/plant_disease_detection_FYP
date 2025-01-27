import React, { useRef, useState } from "react";
import { View, Button, Text, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useCameraPermissions } from "expo-camera";
import axios from "axios";
import { permissionStyle } from "../styles/styles";
import Homer from "./Main/Homer";
import DetailedDescription from "./Main/DetailedDescription";
import CaptureCamera from "./Main/CaptureCamera";
import Camerar from "./Main/Camerar";
import Uploaded from "./Main/Uploaded";
import { IP_CONFIG } from "@env";

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

  //loading stuff
  const [isLoading, setIsLoading] = useState(false);

  let val;
  if (Platform.OS === "android") {
    val = IP_CONFIG; // change this ip address according to your device's ip address
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
          <Homer
            setCurrentView={setCurrentView}
            setCameraActive={setCameraActive}
            statsCheck={statsCheck}
            stats={stats}
          />
        );
      case "upload":
        return (
          <Uploaded
            prediction={prediction}
            selectedPlant={selectedPlant}
            imageUri={imageUri}
            setSelectedPlant={setSelectedPlant}
            setPrediction={setPrediction}
            uploadImage={uploadImage}
            setImageUri={setImageUri}
            promptTheLLM={setCurrentView}
            setCurrentView={setCurrentView}
            isLoading={isLoading}
            selectImage={selectImage}
          />
        );
      case "camera":
        return (
          <Camerar
            cameraRef={cameraRef}
            setCurrentView={setCurrentView}
            imageUri={imageUri}
            setImageUri={setImageUri}
            setPrediction={setPrediction}
            facing={facing}
            toggleCameraFacing={toggleCameraFacing}
            takePicture={takePicture}
          />
        );
      case "cameraCapture":
        return (
          <CaptureCamera
            prediction={prediction}
            imageUri={imageUri}
            setImageUri={setImageUri}
            uploadPhoto={uploadPhoto}
            retakePicture={retakePicture}
            capturedImage={capturedImage}
            selectedPlant={selectedPlant}
            setSelectedPlant={setSelectedPlant}
            setPrediction={setPrediction}
            isLoading={isLoading}
            setCurrentView={setCurrentView}
            promptTheLLM={setCurrentView}
          />
        );
      case "detailedDescription":
        return (
          <DetailedDescription
            val={val}
            setCurrentView={setCurrentView}
            setImageUri={setImageUri}
            selectedPlant={selectedPlant}
            setSelectedPlant={setSelectedPlant}
            prediction={prediction}
            setPrediction={setPrediction}
          />
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
