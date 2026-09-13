import { useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { register, login, logout, genAccessToken } from "../service/api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, authIsLoading, setAuthIsLoading } = context;

  const handleRegister = useCallback(
    async (name, email, password) => {
      setAuthIsLoading(true);
      const data = await register(name, email, password);
      setUser(data.user);
      setAuthIsLoading(false);
    },
    [setAuthIsLoading, setUser],
  );

  const handleLogin = useCallback(
    async (email, password) => {
      setAuthIsLoading(true);
      const data = await login(email, password);
      setUser(data.user);
      setAuthIsLoading(false);
    },
    [setAuthIsLoading, setUser],
  );

  const handleLogout = useCallback(async () => {
    setAuthIsLoading(true);
    await logout();
    setUser(null);
    setAuthIsLoading(false);
  }, [setAuthIsLoading, setUser]);

  const handleGenAccessToken = useCallback(
    async (refreshToken) => {
      setAuthIsLoading(true);
      await genAccessToken(refreshToken);
      setAuthIsLoading(false);
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
