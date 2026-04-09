import axios from "axios";

// Use NEXT_PUBLIC_ environment variable in Next.js
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
console.log("🧩 API base URL:", baseURL);

const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Register user
export const registerUser = async (formData) => {
  try {
    const response = await API.post("/auth/register", formData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Login user
export const loginUser = async (formData) => {
  try {
    const response = await API.post("/auth/login", formData);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export default API;
