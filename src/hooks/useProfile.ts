import { useEffect, useState } from "react";
import api from "@/services/api";

export function useProfile(profileReloadKey: number) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    api.get("/employees/profile")
      .then((res) => setProfile(res.data))
      .catch(() => setError("Gagal mengambil profile"))
      .then(() => setLoading(false));
  }, []);

  return { profile, loading, error };
}
