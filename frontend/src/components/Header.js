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
      <Text style={styles.headerText}>
        <Text style={styles.letter}>P</Text>
        <Text style={styles.letter}>D</Text>
        <Text style={styles.letter}>P</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({

   headerContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bolder',
    color: '#333',
    cursor:'pointer',
  },
  letter: {
    marginHorizontal: 2,
  },
});

export default Header;
