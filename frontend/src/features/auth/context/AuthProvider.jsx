import { useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authIsLoading, setAuthIsLoading] = useState(false);

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
