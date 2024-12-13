import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const Profile = ({ navigation }) => {
  const handleLogout = () => {
    // Implement your logout logic here
    // For example, you can reset the isLoggedIn state or navigate to the Login screen
    console.log("User logged out");
    // Example: navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default Profile;
