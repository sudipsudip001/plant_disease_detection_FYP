// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install @expo/vector-icons
import Home from "./src/pages/Home";
import Upload from "./src/pages/Upload";
import Login from "./src/pages/Login";
import Signup from "./src/pages/Signup";

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown:true,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Upload") {
              iconName = focused ? "cloud-upload" : "cloud-upload-outline";
            } else if (route.name === "Login") {
              iconName = focused ? "log-in" : "log-in-outline"; // Icon for Login
            } else if (route.name === "Signup") {
              iconName = focused ? "person-add" : "person-add-outline"; // Icon for SignUp
            }
            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "green",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Upload" component={Upload} />
        <Tab.Screen name="Login" component={Login} />
        <Tab.Screen name="Signup" component={Signup} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
