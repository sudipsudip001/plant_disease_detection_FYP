// src/pages/Login.js
import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Add your login logic here
    if (email && password) {
      // Navigate to Home after successful login
      navigation.navigate("Home");
    } else {
      alert("Please enter valid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
            <Text style={styles.loginText}>
            Create new Account Here {" "}
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate("Signup")}
            >
              Sign Up
            </Text>
            </Text>
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
   loginText: {
    marginTop: 20,
    fontSize: 16,
  },
  loginLink: {
    color: "blue",
  },
});

export default Login;
