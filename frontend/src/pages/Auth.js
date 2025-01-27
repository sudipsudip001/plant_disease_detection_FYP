import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

const Profile = ({ handleLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page </Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const Auth = ({ navigation }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleSignup = () => {
    if (email && password && confirmPassword) {
      if (password === confirmPassword) {
        Alert.alert("Signed up successfully", `Welcome, ${email}`);
        setIsAuthenticated(true); // Set authenticated state to true
      } else {
        Alert.alert("Error", "Passwords do not match");
      }
    } else {
      Alert.alert("Error", "Please fill out all fields");
    }
  };

  const handleLogin = () => {
    if (loginEmail && loginPassword) {
      setIsAuthenticated(true); // Set authenticated state to true
    } else {
      alert("Please enter valid credentials");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false); // Set authenticated state to false
    console.log("User logged out");
  };

  if (isAuthenticated) {
    return <Profile handleLogout={handleLogout} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.signupContainer}>
        <Text style={styles.title}>User Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          secureTextEntry
          onChangeText={setConfirmPassword}
        />
        <Button title="Sign Up" onPress={handleSignup} />
      </View>

      <View style={styles.separator} />

      <View style={styles.loginContainer}>
        <Text style={styles.title}>User Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={loginEmail}
          onChangeText={setLoginEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={loginPassword}
          onChangeText={setLoginPassword}
        />
        <Button style={styles.button} title="Login" onPress={handleLogin} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  signupContainer: {
    width: "100%",
    marginBottom: 40,
  },
  loginContainer: {
    width: "100%",
  },
  button: {
    width: "100%",
    backgroundColor: "#90ee90", // Light green background color
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
  },

  separator: {
    height: 2,
    width: "100%",
    backgroundColor: "black",
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
  },
  loginText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
  loginLink: {
    color: "green",
  },
});

export default Auth;
