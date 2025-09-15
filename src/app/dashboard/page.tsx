"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTodayAttendance } from "@/hooks/useTodayAttendance";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect } from "react";
import { useState } from "react";
import ProfilePhoto from "@/components/ProfilePhoto";
import { useProfile } from "@/hooks/useProfile";
import api from "@/services/api";

export default function DashboardPage() {
  // ...existing code...
  const router = useRouter();
  const [profileReloadKey, setProfileReloadKey] = useState(0);
  useEffect(() => {
    // Setiap kali dashboard dibuka, reload profile agar foto terbaru
    setProfileReloadKey((k) => k + 1);
  }, []);
  const { profile, loading: profileLoading, error: profileError } = useProfile(profileReloadKey);
  useEffect(() => {
    if (profileLoading) return;
    if (profileError === "Gagal mengambil profile") {
      router.replace("/login");
      return;
    }
    if (profile && profile.role !== "staff") {
      router.replace("/admin");
    }
  }, [profile, profileLoading, profileError, router]);

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

  if (profileLoading) return <div className="p-8 text-center">Loading...</div>;
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <span className="font-bold">Dashboard</span>
        <div className="flex items-center gap-2">
    <span>{profile?.name}</span>
          <button className="bg-red-600 px-3 py-1 rounded text-white" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold mb-2">Selamat datang, {profile?.name}</h2>
          <ProfilePhoto
            photoUrl={profile?.photoUrl || "https://upload.wikimedia.org/wikipedia/commons/f/fd/Mysterious_profile_%282013%3B_cropped_2023%29.jpg" } //|| "/next.svg"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a href="/profile" className="bg-blue-50 p-4 rounded shadow hover:bg-blue-100 flex items-center justify-center">Profile</a>
          <a href="/summary" className="bg-blue-50 p-4 rounded shadow hover:bg-blue-100 flex items-center justify-center">Summary</a>
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
