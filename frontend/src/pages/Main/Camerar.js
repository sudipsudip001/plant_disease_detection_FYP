import React from "react";
import { View, TouchableOpacity, Text, Button } from "react-native";
import { CameraView } from "expo-camera";
import { styles } from "../../styles/styles";

function Camerar({
  cameraRef,
  setCurrentView,
  setImageUri,
  setPrediction,
  facing,
  toggleCameraFacing,
  takePicture,
}) {
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        contentFit="cover"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.captureButtonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
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
}

export default Camerar;
