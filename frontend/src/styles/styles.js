// styles.js
import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const mainHomeStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(240, 240, 240, 0.5)", // Semi-transparent background
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // Cover the entire screen
  },
  weatherContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent white background
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1, // Border width
    borderColor: "rgba(255, 255, 255, 0.4)", // Border color (dark green)
  },
  weatherText: {
    textAlign: "center",
    fontSize: 19,
    fontWeight: "500",
    paddingBottom: "10px",
  },
  textStyle: {
    fontSize: 15,
    color: "black",
    textAlign: "left",
    marginVertical: 2,
    fontWeight: "400",
  },
  weatherIcon: {
    width: 90,
    height: 80,
  },
  buttonText: {
    borderRadius: 5,
    padding: 8,
    backgroundColor: "#2E8B57",
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  predictionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 200,
  },
  buttonContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 16,
  },
  button: {
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 10,
  },
  captureButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 15,
    paddingHorizontal: 30,
  },
  captureButtonText: {
    color: "black",
    fontSize: 18,
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    backgroundColor: "#F5FCFF88",
  },
});

export const pickerStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  picker: {
    height: 50,
    width: 150,
    marginVertical: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  predictionContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  predictionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    marginVertical: 10,
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    backgroundColor: "#F5FCFF88",
  },
});

export const homeStyle = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column", // Changed to column for better stacking on smaller screens
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  button: {
    flexDirection: "row",
    alignItems: "center", // Center items vertically
    justifyContent: "center",
    width: "80%", // Use percentage-based width
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    alignItems: "center",
    gap: "10px",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusContainer: {
    width: "90%", // Use percentage-based width
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    color: "green",
    fontWeight: "bold", // Make the text bold
    textAlign: "center", // Center the text
    marginVertical: 10, // Add vertical margin for spacing
  },
});

export const permissionStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  message: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export const detailStyle = StyleSheet.create({
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
    maxWidth: width - 20,
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
