import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/auth`,
});

const register = async (name, email, password) => {
  const response = await api.post("/register", {
    name,
    email,
    password,
  });

  return response.data;
};

const login = async (email, password) => {
  const response = await api.post("/login", {
    email,
    password,
  });

  return response.data;
};

const logout = async () => {
  const response = await api.get("/logout");
  return response.data;
};

const genAccessToken = async (refreshToken) => {
  const response = await api.post("/refresh", {
    refreshToken,
  });
  return response.data;
};

export { register, login, logout, genAccessToken };
