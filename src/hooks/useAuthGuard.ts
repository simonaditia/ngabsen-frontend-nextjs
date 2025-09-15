import { useEffect, useState } from "react";
import api from "@/services/api";

const TOKEN_KEY = "access_token";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
  position?: string;
  phone?: string;
  photoUrl?: string;
}

export function useAuthGuard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    api
      .get("/employees/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data as User);
      })
      .catch(() => {
        setUser(null);
      })
      .then(() => setLoading(false));
  }, []);

  return { user, loading };
}
