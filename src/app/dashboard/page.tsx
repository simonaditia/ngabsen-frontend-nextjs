"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTodayAttendance } from "@/hooks/useTodayAttendance";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect } from "react";
import { useState } from "react";
import api from "@/services/api";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuthGuard();
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "staff") {
        router.replace("/admin");
      }
    }
  }, [user, loading, router]);

  const [refresh, setRefresh] = useState(0);
  const { data, loading: attendanceLoading, error } = useTodayAttendance(refresh);
  const [loadingClock, setLoadingClock] = useState(false);
  const [status, setStatus] = useState("");

  // Status absen custom
  let attendanceStatus = "Belum absen";
  if (data?.clockIn && !data?.clockOut) attendanceStatus = "Sudah absen masuk";
  if (data?.clockIn && data?.clockOut) attendanceStatus = "Sudah absen masuk dan pulang";

  // Format tanggal dan jam
  function formatDateIndo(dateStr?: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", { hour12: false }) + " (WIB)";
  }
  function formatHariTanggal(date: Date) {
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][date.getDay()];
    const tgl = date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    return `${hari}, ${tgl}`;
  }

  const handleLogout = () => {
  localStorage.removeItem("access_token");
  // Bersihkan cache dan reload penuh
  window.location.href = "/login";
  };

  const handleClockIn = async () => {
    setLoadingClock(true);
    setStatus("");
    try {
      await api.post("/attendance/clock-in");
      setStatus("Clocked In!");
      setRefresh(r => r + 1);
    } catch {
      setStatus("Gagal Clock In");
    } finally {
      setLoadingClock(false);
    }
  };

  const handleClockOut = async () => {
    setLoadingClock(true);
    setStatus("");
    try {
      await api.post("/attendance/clock-out");
      setStatus("Clocked Out!");
      setRefresh(r => r + 1);
    } catch {
      setStatus("Gagal Clock Out");
    } finally {
      setLoadingClock(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <span className="font-bold">Dashboard</span>
        <div className="flex items-center gap-2">
          <span>{user?.name}</span>
          <button className="bg-red-600 px-3 py-1 rounded text-white" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="flex-1 p-8">
        <h2 className="text-xl font-semibold mb-4">Selamat datang, {user?.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a href="/profile" className="bg-white p-4 rounded shadow hover:bg-blue-50">Profile</a>
          <a href="/summary" className="bg-white p-4 rounded shadow hover:bg-blue-50">Summary</a>
        </div>
        <div className="mt-8 bg-white rounded shadow p-6 max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-2">Attendance Hari Ini</h3>
          {attendanceLoading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="mb-2">Tanggal: {formatHariTanggal(new Date())}</div>
          <div className="mb-2">Clock-in: {formatDateIndo(data?.clockIn)}</div>
          <div className="mb-2">Clock-out: {formatDateIndo(data?.clockOut)}</div>
          <div className="mb-2">Status: {attendanceStatus}</div>
          <div className="flex gap-4 mt-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleClockIn}
              disabled={!!data?.clockIn || !!data?.clockOut || loadingClock}
            >
              {loadingClock ? "Loading..." : "Clock In"}
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleClockOut}
              disabled={!data?.clockIn || !!data?.clockOut || loadingClock}
            >
              {loadingClock ? "Loading..." : "Clock Out"}
            </button>
          </div>
          {status && <div className="mt-2 text-blue-600 font-semibold">{status}</div>}
        </div>
      </main>
    </div>
  );
}
