"use client";
import { useState } from "react";
import { saveAs } from "file-saver";
import { useAdminEmployees } from "@/hooks/useAdminEmployees";
import { useAdminAttendance } from "@/hooks/useAdminAttendance";

export default function AdminAttendancePage() {
  // ...existing code...
  const [startDate, setStartDate] = useState("2025-09-01");
  const [endDate, setEndDate] = useState("2025-09-30");
  const [employeeId, setEmployeeId] = useState("");
  const { employees, loading: loadingEmp } = useAdminEmployees();
  const { data, loading, error } = useAdminAttendance(employeeId, startDate, endDate);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Attendance Monitor</h1>
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
          <select
            className="border p-2 rounded"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map((emp: any) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Clock-in</th>
              <th className="border p-2">Clock-out</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, idx: number) => (
              <tr key={idx}>
                <td className="border p-2">{row.employee.name}</td>
                <td className="border p-2">{row.date}</td>
                <td className="border p-2">{row.clockIn}</td>
                <td className="border p-2">{row.clockOut}</td>
                <td className="border p-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          onClick={() => {
            const csvRows = [
              ["Name", "Date", "Clock-in", "Clock-out", "Status"],
              ...data.map((row: any) => [
                row.employee.name,
                row.date,
                row.clockIn,
                row.clockOut,
                row.status,
              ]),
            ];
            const csvContent = csvRows.map(r => r.join(",")).join("\n");
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
