import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("jwm_simulabtech_user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("jwm_simulabtech_user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Informe e-mail e senha.");
    }

    // Temporário: posteriormente será substituído pela API MERN.
    const loggedUser = {
      id: "demo-001",
      name: "José Ueslei",
      email,
      role: "student",
      avatar: "JU",
    };

    setUser(loggedUser);

    localStorage.setItem(
      "jwm_simulabtech_user",
      JSON.stringify(loggedUser)
    );

    return loggedUser;
  };

  const register = async (data) => {
    if (!data.name || !data.email || !data.password) {
      throw new Error("Preencha os campos obrigatórios.");
    }

    const newUser = {
      id: `demo-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: "student",
      avatar: data.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    };

    setUser(newUser);

    localStorage.setItem(
      "jwm_simulabtech_user",
      JSON.stringify(newUser)
    );

    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jwm_simulabtech_user");
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
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider."
    );
  }

  return context;
}