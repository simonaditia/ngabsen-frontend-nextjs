import { useEffect, useState } from "react";
import api from "@/services/api";

export function useTodayAttendance(refresh = 0) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startDate = yesterday.toLocaleDateString('en-CA'); // Format YYYY-MM-DD
    const endDate = today.toLocaleDateString('en-CA');
    api.get(`/attendance/summary?start=${startDate}&end=${endDate}`)
      .then(res => setData(Array.isArray(res.data) ? res.data[0] : null))
      .catch(() => setError("Gagal mengambil data absensi hari ini"))
      .then(() => setLoading(false));
  }, [refresh]);

  return { data, loading, error };
}
