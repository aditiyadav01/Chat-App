import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://chatappbackend-9ww1.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
