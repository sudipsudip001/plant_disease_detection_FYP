import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Button,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import RNEventSource from "react-native-event-source";
import { detailStyle } from "../../styles/styles";

function Chat({
  setCurrentView,
  setImageUri,
  setSelectedPlant,
  setPrediction,
}) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamComplete, setIsStreamComplete] = useState(false);
  const eventSourceRef = useRef(null);
  const scrollViewRef = useRef(null);

  const [startSSE, setStartSSE] = useState(false);

  const val = "http://192.168.1.71:8000";
  //to control the input state
  const [message, setMessage] = useState("");

  function Nullifier() {
    setCurrentView("home");
    setImageUri(null);
    setSelectedPlant("potato");
    setPrediction(null);
  }

  const connectToSSE = (question) => {
    setIsLoading(true);
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const url = `${val}/converse?question=${encodeURIComponent(question)}`;

      setIsLoading(true);
      setCurrentMessage("");
      setIsStreamComplete(false);

      eventSourceRef.current = new RNEventSource(url, {
        headers: {
          Accept: "text/event-stream",
        },
      });

      eventSourceRef.current.addEventListener("open", () => {
        setIsConnected(true);
        setError("");
        setIsLoading(false);
      });

      eventSourceRef.current.addEventListener("message", (event) => {
        try {
          if (event.data.includes("Stream completed")) {
            setIsStreamComplete(true);
            setIsConnected(false);
            eventSourceRef.current?.close();
            return;
          }

          const data = JSON.parse(event.data);
          if (data.error) {
            setError(String(data.error));
            return;
          }

          const newContent =
            typeof data.content === "string"
              ? data.content
              : JSON.stringify(data.content);

          setCurrentMessage((prev) => prev + newContent);

          scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch (e) {
          if (event.data.includes("Stream completed")) {
            setIsStreamComplete(true);
            setStartSSE(false);
            setIsConnected(false);
            eventSourceRef.current?.close();
            return;
          }

          const newContent = String(event.data);
          setCurrentMessage((prev) => prev + newContent);
        }
      });

      eventSourceRef.current.addEventListener("close", () => {
        setIsConnected(false);
        setIsStreamComplete(true);
        setStartSSE(false);
        eventSourceRef.current?.close();
      });

      eventSourceRef.current.addEventListener("error", (err) => {
        setIsConnected(false);
        setError(String(err.message || "Connection error. Please try again"));
        setIsLoading(false);
        setIsStreamComplete(true);
        setStartSSE(false);
        eventSourceRef.current?.close();
      });
    } catch (e) {
      setIsConnected(false);
      setError(String(e.message || "Failed to establish connection"));
      setIsLoading(false);
      setIsStreamComplete(true);
      setStartSSE(false);
    }
  };

  useEffect(() => {
    if (startSSE) {
      connectToSSE(message);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [startSSE]);
  return (
    <SafeAreaView style={detailStyle.container}>
      <View style={detailStyle.header}>
        <Button
          onPress={() => {
            setStartSSE(true);
          }}
          title="🦙"
        />
        <Button
          onPress={() => {
            Nullifier();
          }}
          title="Home"
        />
        <Text style={detailStyle.title}>Converse with LLAMA</Text>
        <View style={detailStyle.statusContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : (
            <Text
              style={[
                detailStyle.status,
                isConnected ? detailStyle.connected : detailStyle.disconnected,
              ]}
            >
              .
            </Text>
          )}
        </View>
      </View>
      {error !== "" && (
        <View style={detailStyle.errorContainer}>
          <Text style={detailStyle.error}>{error}</Text>
        </View>
      )}
      <TextInput
        style={detailStyle.input}
        value={message}
        onChangeText={(text) => setMessage(text)}
        onSubmitEditing={() => console.warn("Message edited")}
        placeholder="Type in message..."
      />
      <ScrollView
        ref={scrollViewRef}
        style={detailStyle.scrollView}
        contentContainerStyle={detailStyle.scrollContent}
      >
        <View style={detailStyle.messageContainer}>
          <Text style={detailStyle.messageContent}>
            {currentMessage}
            {isConnected && !isStreamComplete && (
              <Text style={detailStyle.cursor}>▋</Text>
            )}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Chat;
