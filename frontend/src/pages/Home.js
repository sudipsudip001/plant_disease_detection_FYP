import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  ImageBackground,
  Animated,
  Image,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { mainHomeStyle } from "../styles/styles";

const Home = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      fetchWeatherData(latitude, longitude);
    })();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fetchWeatherData = async (latitude, longitude) => {
    const apiKey = "5cc6ec3c0106add301d6c59656968d4a";
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();
    setWeatherData(data);
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.rawpixel.com/image_social_landscape/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdjk4Ni1iZy0wMi1rcWhlM3dpdC5qcGc.jpg",
      }}
      style={mainHomeStyle.backgroundImage}
    >
      <View style={mainHomeStyle.container}>
        <Animated.Text style={[mainHomeStyle.title, { opacity: fadeAnim }]}>
           Plant Disease Prediction App!
        </Animated.Text>

        <View>
          {weatherData && (
            <View style={mainHomeStyle.weatherContainer}>
              <View>
                <Text style={mainHomeStyle.weatherText}>Weather</Text>
                <Text style={mainHomeStyle.textStyle}>
                  Location: {weatherData.name}
                </Text>
                <Text style={mainHomeStyle.textStyle}>
                  Temperature: {weatherData.main.temp}°C
                </Text>
                <Text style={mainHomeStyle.textStyle}>
                  Status: {weatherData.weather[0].description}
                </Text>
              </View>
              <View>
                <Image
                  source={{
                    uri: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
                  }}
                  style={mainHomeStyle.weatherIcon}
                />
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={mainHomeStyle.button}
          onPress={() => navigation.navigate("Upload")}
        >
          <Text style={mainHomeStyle.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Home;
