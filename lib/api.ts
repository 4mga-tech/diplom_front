// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// export const api = axios.create({
//   // baseURL: "http://192.168.1.5:4000/api",
//   // baseURL: "http://172.16.147.239:4000/api",
//   // baseURL: "http://172.16.149.247:4000/api",
//   baseURL: "http://172.16.146.175:4000/api",
//   timeout: 10000,
// });

// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("token");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
