import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { register, login, logout, genAccessToken, getMe } from "../service/api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, authIsLoading, setAuthIsLoading } = context;

  const handleRegister = async (name, email, password) => {
    setAuthIsLoading(true);
    const data = await register(name, email, password);
    setUser(data.user);
    setAuthIsLoading(false);
  };

  const handleLogin = async (email, password) => {
    setAuthIsLoading(true);
    const data = await login(email, password);
    setUser(data.user);
    setAuthIsLoading(false);
  };

  const handleLogout = async () => {
    setAuthIsLoading(true);
    await logout();
    setUser(null);
    setAuthIsLoading(false);
  };

  const handleGenAccessToken = async (refreshToken) => {
    setAuthIsLoading(true);
    await genAccessToken(refreshToken);
    setAuthIsLoading(false);
  };

  const handleGetMe = async () => {
    setAuthIsLoading(true);
    const data = await getMe();
    setUser(data.user);
    setAuthIsLoading(false);
  };

  return {
    user,
    setUser,
    authIsLoading,
    setAuthIsLoading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGenAccessToken,
    handleGetMe,
  };
};
