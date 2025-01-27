import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  Text,
  ScrollView,
  View,
  ActivityIndicator,
  Button,
} from "react-native";
import RNEventSource from "react-native-event-source";
import { detailStyle } from "../../styles/styles";

const DetailedDescription = ({
  val,
  setCurrentView,
  setImageUri,
  selectedPlant,
  setSelectedPlant,
  prediction,
  setPrediction,
}) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamComplete, setIsStreamComplete] = useState(false);
  const eventSourceRef = useRef(null);
  const scrollViewRef = useRef(null);

  const [startSSE, setStartSSE] = useState(false);

  function Nullifier() {
    setCurrentMessage("");
    setError("");
    setIsConnected(false);
    setIsLoading(false);
    setIsStreamComplete(false);
    setStartSSE(false);

    setImageUri(null);
    setSelectedPlant("potato");
    setPrediction(null);
  }

  const connectToSSE = (plant, disease) => {
    setIsLoading(true);
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const url = `${val}/chat?plant=${encodeURIComponent(
        plant
      )}&disease=${encodeURIComponent(disease)}`;

      setIsLoading(true);
      setCurrentMessage(""); // Reset current message
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

          // Scroll to bottom when new content arrives
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch (e) {
          if (event.data.includes("Stream completed")) {
            setIsStreamComplete(true);
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
        eventSourceRef.current?.close();
      });

      eventSourceRef.current.addEventListener("error", (err) => {
        setIsConnected(false);
        setError(String(err.message || "Connection error. Please try again."));
        setIsLoading(false);
        setIsStreamComplete(true);
        eventSourceRef.current?.close();
      });
    } catch (e) {
      setIsConnected(false);
      setError(String(e.message || "Failed to establish connection"));
      setIsLoading(false);
      setIsStreamComplete(true);
    }
  };

  useEffect(() => {
    if (startSSE) {
      connectToSSE(selectedPlant, prediction.predicted_class);
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
        {!isStreamComplete && (
          <Button
            onPress={() => {
              setStartSSE(true);
            }}
            title="Details"
          />
        )}
        <Button
          onPress={() => {
            setCurrentView("home");
            Nullifier();
          }}
          title="Home"
        />
        <Text style={detailStyle.title}>Plant Disease Analysis</Text>
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
              {isConnected ? "Connected" : "Disconnected"}
            </Text>
          )}
        </View>
      </View>

      {error !== "" && (
        <View style={detailStyle.errorContainer}>
          <Text style={detailStyle.error}>{error}</Text>
        </View>
      )}

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
            {isStreamComplete && "\n\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tThank You ..."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailedDescription;
