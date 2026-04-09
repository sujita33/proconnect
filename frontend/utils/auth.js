// utils/auth.js

// Save user session
export const saveSession = (user, token) => {
  if (typeof window === "undefined") return;

  // Assign temporary username only if it doesn't exist yet
  if (!user.name) {
    user.name = `User${Math.floor(Math.random() * 1000)}`;
  }

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
};

// Get logged-in user
export const getUser = () => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

// Get token
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Check login status
export const isLoggedIn = () => !!getToken();

// Logout user
export const logout = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("user");
  localStorage.removeItem("token");
  // optional: redirect to login after logout
  window.location.href = "/login";
};
