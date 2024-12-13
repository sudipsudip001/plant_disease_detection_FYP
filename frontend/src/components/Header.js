import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import moment from "moment-timezone";

const Header = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date) => {
    return moment(date).tz("Asia/Kathmandu").format("HH:mm:ss A");
  };

  return (
    <View style={styles.headerContainer}>
      <Text
        onPress={() => navigation.navigate("Home")}
        style={styles.dateTimeText}
      >
        {formatDateTime(currentDateTime)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({

  dateTimeText: {
    fontSize: 13,
    fontWeight: "bold",
  },
});

export default Header;
