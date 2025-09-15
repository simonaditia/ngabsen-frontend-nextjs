"use client";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { useAttendance } from "@/hooks/useAttendance";
import { useAuthGuard } from "@/hooks/useAuthGuard";
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

const calculateTotalHours = (clockIn: string, clockOut: string) => {
  if (!clockIn || !clockOut) return "";
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  const diffMs = end.getTime() - start.getTime(); // selisih ms
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60)); // jam
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)); // menit
  return `${diffHrs}h ${diffMins}m`;
};

export default function SummaryPage() {
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

  const { data, loading: attendanceLoading, error } = useAttendance(startDate, endDate);


  if (loading) return <div className="p-8 text-center">Loading...</div>;

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
  {attendanceLoading && <div className="text-center">Loading...</div>}
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
            {data.map((row: any) => {
                const formatDateOnly = (dateStr: string) =>
                dateStr
                    ? new Date(dateStr).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    })
                    : "";

                const formatDate = (dateStr: string) =>
                dateStr
                    ? new Date(dateStr).toLocaleString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    })
                    : "";

                return (
              <tr key={row.date}>
                <td className="border p-2">{formatDateOnly(row.date)}</td>
                <td className="border p-2">{formatDate(row.clockIn)}</td>
                <td className="border p-2">{formatDate(row.clockOut)}</td>
                <td className="border p-2">{calculateTotalHours(row.clockIn, row.clockOut)}</td>
                <td className="border p-2">{row.status}</td>
              </tr>
            )
            })}
          </tbody>
        </table>
        {/* <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">Export CSV</button> */}
        <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                  onClick={() => {
                     const csvRows = [
                        ["Date", "Clock-in", "Clock-out", "Total-Hours", "Status"],
                        ...data.map((row: any) => {
                            const formatDate = (dateStr: string) =>
                            dateStr ? new Date(dateStr).toLocaleString("id-ID", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit"
                            }) : "";

                            return [
                            formatDate(row.date),
                            formatDate(row.clockIn),
                            formatDate(row.clockOut),
                            calculateTotalHours(row.clockIn, row.clockOut),
                            row.status,
                            ];
                        }),
                        ];
                    const csvContent = csvRows.map(r => r.join(";")).join("\n");
                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                    saveAs(blob, "attendance.csv");
                  }}
                >
                  Export CSV
                </button>
        {/* TODO: Export PDF */}
      </div>
    </div>
  );
}
