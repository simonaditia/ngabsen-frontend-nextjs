
"use client";
import { useEffect } from "react";
import { useAdminEmployees } from "@/hooks/useAdminEmployees";
import { useAdminAttendance } from "@/hooks/useAdminAttendance";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  // Proteksi: hanya admin yang bisa akses
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const { employees, loading: loadingEmp } = useAdminEmployees();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const startDate = yesterday.toLocaleDateString('en-CA'); // Format YYYY-MM-DD
  const endDate = today.toLocaleDateString('en-CA');

  const { data: attendance, loading: loadingAtt } = useAdminAttendance("", startDate, endDate);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <span className="font-bold">Admin Dashboard</span>
        <button className="bg-red-600 px-3 py-1 rounded text-white" onClick={handleLogout}>Logout</button>
      </header>
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow">
            Total Employees: {loadingEmp ? "..." : employees.length}
          </div>
          <div className="bg-white p-4 rounded shadow">
            Today's Attendance: {loadingAtt ? "..." : attendance.length}
          </div>
          <div className="bg-white p-4 rounded shadow">Pending Updates: {/* TODO */}</div>
        </div>
        <div className="bg-white p-4 rounded shadow mb-4">Real-time Notifications Panel {/* TODO: Firebase */}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/admin/employees" className="bg-blue-50 p-4 rounded shadow hover:bg-blue-100">Employee Management</a>
          <a href="/admin/attendance" className="bg-blue-50 p-4 rounded shadow hover:bg-blue-100">Attendance Monitor</a>
        </div>
      </main>
    </div>
  );
}
