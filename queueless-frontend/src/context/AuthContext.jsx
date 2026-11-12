import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "queueless_auth";

function loadAuth() {
  try {
    return (
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        user: null,
        token: null,
      }
    );
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth);

  const login = (user, token) => {
    const next = { user, token };
    setAuth(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user: auth.user, token: auth.token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
