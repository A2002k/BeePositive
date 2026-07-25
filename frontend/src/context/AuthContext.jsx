import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("beepositiveUser");

    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Unable to read saved user:", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);
  const [token, setToken] = useState(
    () => localStorage.getItem("beepositiveToken") || ""
  );

  const saveAuthentication = (authData) => {
    const savedToken = authData.token;
    const savedUser = authData.user;

    localStorage.setItem(
      "beepositiveToken",
      savedToken
    );

    localStorage.setItem(
      "beepositiveUser",
      JSON.stringify(savedUser)
    );

    setToken(savedToken);
    setUser(savedUser);
  };

  const register = async (formData) => {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to create your account."
    );
  }

  return data;
};

  const login = async (credentials) => {
    const response = await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to log in."
      );
    }

    saveAuthentication(data);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("beepositiveToken");
    localStorage.removeItem("beepositiveUser");

    setToken("");
    setUser(null);
  };

  const updateUserLocally = (newUserData) => {
    setUser((currentUser) => {
      const updatedUser = {
        ...currentUser,
        ...newUserData,
      };

      localStorage.setItem(
        "beepositiveUser",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      register,
      login,
      logout,
      updateUserLocally,
    }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}