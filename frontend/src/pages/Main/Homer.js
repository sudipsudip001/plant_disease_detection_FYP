import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { homeStyle } from "../../styles/styles";

function Homer({ setCurrentView, setCameraActive, statsCheck, stats }) {
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
          <Text style={homeStyle.statusText}>Status: {stats.data.status}</Text>
        </View>
      )}
    </View>
  );
}

export default Homer;
