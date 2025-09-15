"use client";
import { useState } from "react";
import { useAdminEmployees } from "@/hooks/useAdminEmployees";
import { useEffect } from "react";
import api from "@/services/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
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
  // ...existing code...
  const [refresh, setRefresh] = useState(0);
  const { employees, loading: employeesLoading, error } = useAdminEmployees(refresh);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleEdit = (emp: any) => {
    setEditId(emp.id);
    setEditData(emp);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await api.post("/admin/employees/update", { id: editId, data: editData });
      setEditId(null);
      setRefresh(r => r + 1);
    } catch {
      setSaveError("Gagal update karyawan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
  {employeesLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <table className="w-full border text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Position</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp: any) => (
            <tr key={emp.id}>
              <td className="border p-2">{editId === emp.id ? <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="border p-1 rounded" /> : emp.name}</td>
              <td className="border p-2">{emp.email}</td>
              <td className="border p-2">{editId === emp.id ? <input value={editData.position} onChange={e => setEditData({ ...editData, position: e.target.value })} className="border p-1 rounded" /> : emp.position}</td>
              <td className="border p-2">{editId === emp.id ? <input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="border p-1 rounded" /> : emp.phone}</td>
              <td className="border p-2">
                {editId === emp.id ? (
                  <>
                    <button className="bg-green-600 text-white px-2 py-1 rounded mr-2" onClick={handleSave} disabled={saving}>Save</button>
                    <button className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditId(null)}>Cancel</button>
                    {saveError && <div className="text-red-500 text-xs">{saveError}</div>}
                  </>
                ) : (
                  <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={() => handleEdit(emp)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* TODO: Add Employee, Delete Employee */}
    </div>
  );
}
