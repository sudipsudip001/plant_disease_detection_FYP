import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView,
  View,
  Platform,
  Dimensions,
  ActivityIndicator,
  Button,
} from "react-native";
import RNEventSource from "react-native-event-source";

const windowWidth = Dimensions.get("window").width;

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          onPress={() => {
            setStartSSE(true);
          }}
          title="Generate"
        />
        <Button
          onPress={() => {
            setCurrentView("home");
            Nullifier();
          }}
          title="Home"
        />
        <Text style={styles.title}>Plant Disease Analysis</Text>
        <View style={styles.statusContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : (
            <Text
              style={[
                styles.status,
                isConnected ? styles.connected : styles.disconnected,
              ]}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Text>
          )}
        </View>
      </View>

      {error !== "" && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.messageContainer}>
          <Text style={styles.messageContent}>
            {currentMessage}
            {isConnected && !isStreamComplete && (
              <Text style={styles.cursor}>▋</Text>
            )}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 0 : 25,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  status: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  connected: {
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
  },
  disconnected: {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  error: {
    color: "#C62828",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    maxWidth: windowWidth - 20,
  },
  messageContent: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    textAlign: "left",
  },
  cursor: {
    color: "#2196F3",
    fontWeight: "bold",
    opacity: 0.7,
  },
});

export default DetailedDescription;
