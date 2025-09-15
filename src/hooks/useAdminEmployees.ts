import { useEffect, useState } from "react";
import api from "@/services/api";

export function useAdminEmployees(refresh = 0) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin/employees")
      .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Gagal mengambil data karyawan"))
      .then(() => setLoading(false));
  }, [refresh]);

  return { employees, loading, error };
}
