// import create from "zustand";
// import axios from "axios";

// const baseUrl = "http://localhost:8000/auth";
// const useAuthStore = create((set) => ({
//   isUserAuthenticated: false,
//   user: null,

//   singup: async (username, email, password) => {
//     try {
//       const response = await axios.post(`${baseUrl}/signup`, {
//         username,
//         email,
//         password,
//       });
//       set({ isUserAuthenticated: true, user: response.data });
//     } catch (error) {
//       console.error("Signup failed", error);
//       set({ isUserAuthenticated: false, user: null });
//     }
//   },

//   login: async (email, password) => {
//     try {
//       const response = await axios.post(`${baseUrl}/login`, {
//         email,
//         password,
//       });
//       set({ isUserAuthenticated: true, user: response.data });
//     } catch (error) {
//       console.error("Login failed", error);
//       set({ isUserAuthenticated: false, user: null });
//     }
//   },
//   logout: () => set({ isUserAuthenticated: false, user: null }),
// }));

// export default useAuthStore;
