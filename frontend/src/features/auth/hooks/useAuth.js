import { useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { register, login, logout, genAccessToken } from "../service/api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, authIsLoading, setAuthIsLoading } = context;

  const handleRegister = useCallback(
    async (name, email, password) => {
      try {
        setAuthIsLoading(true);
        const data = await register(name, email, password);
        setUser(data.user);
        setAuthIsLoading(false);
      } catch (error) {
        console.error("Register failed: ", error);
        throw error;
      } finally {
        setAuthIsLoading(false);
      }
    }, [setAuthIsLoading, setUser],
  );

  const handleLogin = useCallback(
    async (email, password) => {
      try {
        setAuthIsLoading(true);
        const data = await login(email, password);
        setUser(data.user);
        setAuthIsLoading(false);
      } catch (error) {
        console.error("Login failed: ", error);
        throw error;
      } finally {
        setAuthIsLoading(false);
      }
    },
    [setAuthIsLoading, setUser],
  );

  const handleLogout = useCallback(async () => {
    try {
      setAuthIsLoading(true);
      await logout();
      setUser(null);
      setAuthIsLoading(false);
    } catch (error) {
      console.error("Logout failed: ", error);
      throw error;
    } finally {
      setAuthIsLoading(false);
    }
  }, [setAuthIsLoading, setUser]);

  const handleGenAccessToken = useCallback(
    async (refreshToken) => {
      try {
        setAuthIsLoading(true);
        await genAccessToken(refreshToken);
        setAuthIsLoading(false);
      } catch (error) {
        console.error("Generate access token failed: ", error);
        throw error;
      } finally {
        setAuthIsLoading(false);
      }
    },
    [setAuthIsLoading],
  );

  return {
    user,
    setUser,
    authIsLoading,
    setAuthIsLoading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGenAccessToken,
  };
};
