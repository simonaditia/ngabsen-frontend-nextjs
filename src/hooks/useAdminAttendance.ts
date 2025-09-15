import { useEffect, useState } from "react";
import api from "@/services/api";

export function useAdminAttendance(employeeId: string, startDate: string, endDate: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/admin/attendance?employee=${employeeId}&start=${startDate}&end=${endDate}`)
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Gagal mengambil data absensi"))
      .then(() => setLoading(false));
  }, [employeeId, startDate, endDate]);

  return { data, loading, error };
}
