// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install @expo/vector-icons
import Home from "./src/pages/Home";
import Upload from "./src/pages/Upload";
import Auth from "./src/pages/Auth";
import Header from "./src/components/Header";
import Profile from "./src/pages/Profile";
import Consults from "./src/pages/Consults";
import { useState } from "react";

const Tab = createBottomTabNavigator();

const App = () => {
  const [isLoggedIn, setisLoggedIn] = useState(false);
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerTitle: () => <Header />,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Predict") {
              iconName = focused ? "stats-chart" : "stats-chart-outline";
            } else if (route.name === "Consults") {
              iconName = focused ? "bulb" : "bulb-outline"; // Icon for Consults
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline"; // Icon for Login
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
        <Tab.Screen name="Predict" component={Upload} />
        {isLoggedIn ? (
          <Tab.Screen name="Profile" component={Profile} />
        ) : (
          <>
          <Tab.Screen name="Consults" component={Consults} />
          <Tab.Screen name="Profile" component={Auth} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
