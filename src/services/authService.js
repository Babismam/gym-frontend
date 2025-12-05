import api from "../config/api";

const TOKEN_KEY = "jwtToken";
const USER_ID_KEY = "userId";
const USERNAME_KEY = "username";
const ROLE_KEY = "role";
const FIRSTNAME_KEY = "firstName";

export async function register(userData) {
  try {
    const payload = { ...userData, role: 'MEMBER' };
    const response = await api.post("/auth/register", payload);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Registration failed";
    throw new Error(message);
  }
}

export async function login(username, password) {
  try {
    const response = await api.post("/auth/login", { username, password });
    const data = response.data;

    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_ID_KEY, data.id);
    sessionStorage.setItem(USERNAME_KEY, data.username);
    sessionStorage.setItem(ROLE_KEY, data.role);
    sessionStorage.setItem(FIRSTNAME_KEY, data.firstName);

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Login failed";
    throw new Error(message);
  }
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(FIRSTNAME_KEY);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUserId() {
  return sessionStorage.getItem(USER_ID_KEY);
}

export function getUsername() {
  return sessionStorage.getItem(USERNAME_KEY);
}

export function getUserRole() {
  return sessionStorage.getItem(ROLE_KEY);
}
export function getFirstName() { 
  return sessionStorage.getItem(FIRSTNAME_KEY);
}

const authService = {
  register,
  login,
  logout,
  getToken,
  getUserId,
  getUsername,
  getUserRole,
  getFirstName,
};

export default authService;