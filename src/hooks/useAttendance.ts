import { useEffect, useState } from "react";
import api from "@/services/api";

export function useAttendance(startDate: string, endDate: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/attendance/summary?start=${startDate}&end=${endDate}`)
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Gagal mengambil data absensi"))
      .then(() => setLoading(false));
  }, [startDate, endDate]);

  return { data, loading, error };
}
