"use client";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function AttendancePage() {
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
  const [status, setStatus] = useState<string>("");
  const [clockedIn, setClockedIn] = useState(false);
  const [clockedOut, setClockedOut] = useState(false);
  const [clockLoading, setClockLoading] = useState(false);
  const [error, setError] = useState("");

  // Proteksi: redirect ke login jika belum login

  const handleClockIn = async () => {
    setClockLoading(true);
    setError("");
    try {
      await api.post("/attendance/clock-in");
      setClockedIn(true);
      setStatus(`Clocked In at ${new Date().toLocaleTimeString()}`);
    } catch {
      setError("Gagal Clock In");
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    setError("");
    try {
      await api.post("/attendance/clock-out");
      setClockedOut(true);
      setStatus(`Clocked Out at ${new Date().toLocaleTimeString()}`);
    } catch {
      setError("Gagal Clock Out");
    } finally {
      setClockLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>
      <div className="bg-white rounded shadow p-6 flex flex-col gap-4">
        <div className="text-lg font-semibold">{new Date().toLocaleDateString()}</div>
        <div className="text-gray-500">{new Date().toLocaleTimeString()}</div>
        <div className="flex gap-4 mt-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
            onClick={handleClockIn}
            disabled={clockedIn || clockLoading}
          >
            {clockLoading ? "Loading..." : "Clock In"}
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
            onClick={handleClockOut}
            disabled={clockedOut || clockLoading}
          >
            {clockLoading ? "Loading..." : "Clock Out"}
          </button>
        </div>
        {status && <div className="mt-4 text-blue-600 font-semibold">{status}</div>}
        {error && <div className="mt-2 text-red-500 font-semibold">{error}</div>}
      </div>
    </div>
  );
}
