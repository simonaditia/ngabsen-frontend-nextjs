"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/services/api";
// Helper untuk simpan token di localStorage
const TOKEN_KEY = "access_token";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
  position?: string;
  phone?: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setLoading(true);
  //   const token = localStorage.getItem(TOKEN_KEY);
  //   if (token) {
  //     api.get("/employees/profile")
  //       .then(res => setUser(res.data as User))
  //       .catch((err) => {
  //         setUser(null);
  //         console.error("Gagal fetch profile saat reload", err);
  //       })
  //       .then(() => setLoading(false));
  //   } else {
  //     setLoading(false);
  //   }
  // }, []);

  useEffect(() => {
  setLoading(true);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    api.get("/employees/profile", { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => {
        console.log("Profile response:", res.data);
        setUser(res.data as User);
        console.log("User context set:", res.data);
      })
      .catch((err) => {
        setUser(null);
        console.error("Gagal fetch profile saat reload", err);
      })
      .then(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const data: any = res.data;
      // Simpan access token di localStorage
      if (data.access_token) {
        localStorage.setItem(TOKEN_KEY, data.access_token);
      }
      // Setelah login, fetch profile
      try {
        const profileRes = await api.get("/employees/profile");
        setUser(profileRes.data as User);
      } catch (err) {
        setUser(null);
        console.error("Gagal fetch profile setelah login", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
