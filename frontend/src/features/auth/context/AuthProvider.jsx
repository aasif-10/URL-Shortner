import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { getMe } from "../service/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data?.user || null);
        setAuthIsLoading(false);
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Error fetching user data:", error);
        }
        setUser(null);
        setAuthIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        authIsLoading,
        setAuthIsLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
