"use client";
import { useState, useEffect } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const dummySummary = [
  {
    date: "2025-09-01",
    clockIn: "08:00",
    clockOut: "17:00",
    totalHours: 9,
    status: "Present",
  },
  // ...data lain
];

export default function SummaryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  // Proteksi: hanya staff yang bisa akses
  useEffect(() => {
    if (user && user.role !== "staff") {
      router.replace("/admin");
    }
  }, [user, router]);
  console.log("user before: ", user)
  console.log("user after: ", user)
  
    const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year, month, 1);
    return startOfMonth.toLocaleDateString('en-CA');
    });

    const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const endOfMonth = new Date(year, month + 1, 0);
    return endOfMonth.toLocaleDateString('en-CA');
});

  const { data, loading, error } = useAttendance(startDate, endDate);


   if (authLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Attendance Summary</h1>
      <div className="bg-white rounded shadow p-6">
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Date</th>
              <th className="border p-2">Clock-in</th>
              <th className="border p-2">Clock-out</th>
              <th className="border p-2">Total Hours</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.date}>
                <td className="border p-2">{row.date}</td>
                <td className="border p-2">{row.clockIn}</td>
                <td className="border p-2">{row.clockOut}</td>
                <td className="border p-2">{row.totalHours}</td>
                <td className="border p-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">Export CSV</button>
        {/* TODO: Export PDF */}
      </div>
    </div>
  );
}
