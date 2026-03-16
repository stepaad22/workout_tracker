import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types";

type AuthType = {
  user: User | null;
  token: string | null;
  isLogged: boolean;
  loading: boolean;
  saveLogin: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedToken !== "undefined" && savedToken !== "null") {
      setToken(savedToken);
    }

    if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (err) {
        console.log(err);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  function saveLogin(newToken: string, newUser: User) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user: user,
        token: token,
        isLogged: !!token && !!user,
        loading: loading,
        saveLogin: saveLogin,
        logout: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const data = useContext(AuthContext);

  if (!data) {
    throw new Error("AuthContext není");
  }

  return data;
}