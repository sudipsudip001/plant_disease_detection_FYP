import axios from "axios";

const baseURL =
  Platform.OS === "android"
    ? "http://192.168.1.68:8000"
    : "http://localhost:8000";

export const checkStats = async () => {
  return await axios.get(baseURL);
};

export const uploadImage = async (imageUri, selectedPlant) => {
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri.uri,
    type: "image/jpeg",
    name: "photo.jpg",
  });

  const final = `${baseURL}/predict/${selectedPlant}`;
  return await axios.post(final, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadPhoto = async (capturedImage, selectedPlant) => {
  const formData = new FormData();
  formData.append("file", {
    uri: capturedImage,
    type: "image/jpeg",
    name: "photo.jpg",
  });

  const final = `${baseURL}/predict/${selectedPlant}`;
  return await axios.post(final, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
