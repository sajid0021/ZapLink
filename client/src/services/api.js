import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:5000/api" : "/api")
});

export default API;
