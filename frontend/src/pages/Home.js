import React, { useEffect, useState, useRef } from "react";
import { View, Text, Button, StyleSheet, Image, Animated } from "react-native";
import moment from "moment-timezone";
import { mainHomeStyle } from "../styles/styles";

const Home = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Fade in to full opacity
      duration: 2000, // Duration of the animation (2 seconds)
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const formatDateTime = (date) => {
    return moment(date).tz("Asia/Kathmandu").format("YYYY-MM-DD HH:mm:ss");
  };

  return (
    <View style={mainHomeStyle.container}>
      <Animated.Text style={[mainHomeStyle.title, { opacity: fadeAnim }]}>
        Welcome to Plant Disease Prediction App!
      </Animated.Text>

      <Image
        source={{
          uri: "https://media.istockphoto.com/id/1181366400/photo/in-the-hands-of-trees-growing-seedlings-bokeh-green-background-female-hand-holding-tree-on.jpg?s=612x612&w=0&k=20&c=jWUMrHgjMY9zQXsAwZFb1jfM6KxZE16-IXI1bvehjQM=",
        }}
        style={mainHomeStyle.image}
      />

      <View style={mainHomeStyle.dateTimeContainer}>
        <Text style={mainHomeStyle.dateTimeText}>
          {formatDateTime(currentDateTime)}
        </Text>
      </View>

      <Button
        title="Get Started"
        onPress={() => navigation.navigate("Upload")}
      />
    </View>
  );
};

export default Home;
