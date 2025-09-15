
"use client";
import { useEffect } from "react";
import { useState } from "react";
import { useAdminEmployees } from "@/hooks/useAdminEmployees";
import { useAdminAttendance } from "@/hooks/useAdminAttendance";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRouter } from "next/navigation";
import { requestDeviceToken, listenFCMMessages } from "@/firebase/firebaseInit";

export default function AdminDashboard() {
  type Notification = {
    id: number;
    title: string;
    message: string;
    targetId: number;
    createdAt: string;
    read: boolean;
  };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // ...existing code...
  useEffect(() => {
    async function fetchNotifications() {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;
      try {
        const res = await fetch("http://localhost:3000/admin/notifications", {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        // handle error
      }
    }
    fetchNotifications();
  }, []);
  const [notif, setNotif] = useState("");
  useEffect(() => {
    async function registerDeviceToken() {
      const token = await requestDeviceToken();
      const accessToken = localStorage.getItem("access_token");
      if (token && accessToken) {
        try {
          await fetch("http://localhost:3000/employees/device-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ deviceToken: token })
          });
          console.log("Device token admin sent to backend:", token);
        } catch (err) {
          setNotif("Gagal mengirim device token admin ke backend.");
        }
      } else if (!token) {
        setNotif("Izin notifikasi browser diblokir atau gagal mendapatkan device token admin. Aktifkan notifikasi di browser!");
      } else {
        setNotif("Akses token tidak ditemukan. Silakan login ulang sebagai admin.");
      }
    }
    registerDeviceToken();
    listenFCMMessages((payload) => {
      setNotif(payload?.notification?.title || "Ada notifikasi baru!");
      console.log("FCM message received (admin):", payload);
    });
  }, []);
  const router = useRouter();
  const { user, loading } = useAuthGuard();
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "admin") {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  const { employees, loading: loadingEmp } = useAdminEmployees();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const startDate = yesterday.toLocaleDateString('en-CA'); // Format YYYY-MM-DD
  const endDate = today.toLocaleDateString('en-CA');

  const { data: attendance, loading: loadingAtt } = useAdminAttendance("", startDate, endDate);

  const handleLogout = () => {
  localStorage.removeItem("access_token");
  window.location.replace("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {notif && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow z-50">
          {notif}
        </div>
      )}
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <span className="font-bold">Admin Dashboard</span>
        <button className="bg-red-600 px-3 py-1 rounded text-white" onClick={handleLogout}>Logout</button>
      </header>
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a href="/admin/employees" className="bg-blue-50 p-4 rounded shadow hover:bg-blue-100">Employee Management</a>
          <a href="/admin/attendance" className="bg-blue-50 p-4 rounded shadow hover:bg-blue-100">Attendance Monitor</a>
        </div>
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="font-bold mb-2">Real-time Notifications Panel</div>
          {notifications.length === 0 ? (
            <div className="text-gray-500">Belum ada notifikasi.</div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notif) => (
                <li key={notif.id} className="py-2">
                  <div className="font-semibold text-blue-700">{notif.title}</div>
                  <div className="text-gray-700">{notif.message}</div>
                  <div className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</div>
                  {!notif.read && <span className="text-xs text-green-600 ml-2">(unread)</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
