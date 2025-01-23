// utils/auth.js
import { jwtDecode } from "jwt-decode";

export const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decodedToken = jwtDecode(token);
  return decodedToken.role;
};
