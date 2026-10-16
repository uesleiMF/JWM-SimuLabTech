import { createContext, useContext, useEffect, useState } from "react";

import {
  apiLogin,
  apiLogout,
  apiMe,
  apiRegister,
  getToken,
  setToken,
} from "../services/api";

const AuthContext = createContext(null);
const USER_KEY = "jwm_simulabtech_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const token = getToken();
      const saved = localStorage.getItem(USER_KEY);

      if (token) {
        try {
          const data = await apiMe();
          if (!cancelled && data?.user) {
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setLoading(false);
            return;
          }
        } catch {
          setToken(null);
        }
      }

      if (saved) {
        try {
          if (!cancelled) setUser(JSON.parse(saved));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      if (!cancelled) setLoading(false);
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Informe e-mail e senha.");
    }

    try {
      const data = await apiLogin({ email, password });
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      // Fallback offline (desenvolvimento sem MongoDB)
      if (
        String(err.message || "").includes("Failed to fetch") ||
        String(err.message || "").includes("NetworkError")
      ) {
        const loggedUser = {
          id: "offline-001",
          name: email.split("@")[0] || "Aluno",
          email,
          role: "student",
          avatar: (email[0] || "A").toUpperCase(),
          offline: true,
        };
        setUser(loggedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
        return loggedUser;
      }
      throw err;
    }
  };

  const register = async (data) => {
    if (!data.name || !data.email || !data.password) {
      throw new Error("Preencha os campos obrigatórios.");
    }

    try {
      const res = await apiRegister({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      return res.user;
    } catch (err) {
      if (
        String(err.message || "").includes("Failed to fetch") ||
        String(err.message || "").includes("NetworkError")
      ) {
        const newUser = {
          id: `offline-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: "student",
          avatar: data.name
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase(),
          offline: true,
        };
        setUser(newUser);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        return newUser;
      }
      throw err;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider.");
  }

  return context;
}
