"use client";
import { useProfile } from "@/hooks/useProfile";
import { useState, useRef, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  // Proteksi: hanya staff yang bisa akses
  useEffect(() => {
    if (user && user.role !== "staff") {
      router.replace("/admin");
    }
  }, [user, router]);
  const { profile, loading, error } = useProfile();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errorEdit, setErrorEdit] = useState("");
  const [successEdit, setSuccessEdit] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || "");
      setPhotoPreview(profile.photoUrl || "/next.svg");
    }
  }, [profile]);

  // Proteksi route: hanya staff yang bisa akses

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Validasi sederhana
  const validate = () => {
    if (!/^08[0-9]{8,11}$/.test(phone)) return "Nomor HP tidak valid";
    if (password && password.length < 6) return "Password minimal 6 karakter";
    return "";
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const errMsg = validate();
    if (errMsg) {
      setErrorEdit(errMsg);
      return;
    }
    setSaving(true);
    setErrorEdit("");
    setSuccessEdit("");
    try {
      let photoUrl = profile?.photoUrl;
      if (photo) {
        // Simulasi upload foto ke server (replace with real upload)
        const formData = new FormData();
        formData.append("file", photo);
        // const res = await api.post("/upload", formData);
        // photoUrl = res.data.url;
        photoUrl = photoPreview;
      }
      await api.patch("/employees/profile", { phone, password: password || undefined, photoUrl });
      setSuccessEdit("Profile updated!");
    } catch {
      setErrorEdit("Gagal update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white rounded shadow p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <img
            src={photoPreview}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <button
            className="bg-gray-200 px-2 py-1 rounded text-sm"
            onClick={() => fileInputRef.current?.click()}
          >Edit Photo</button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <div>
            <div className="font-semibold text-lg">{profile?.name}</div>
            <div className="text-gray-500">{profile?.email}</div>
            <div className="text-gray-500">{profile?.position}</div>
          </div>
        </div>
        <div>
          <label className="block font-medium">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-medium">Change Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="New password"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {errorEdit && <div className="text-red-500">{errorEdit}</div>}
        {successEdit && <div className="text-green-600">{successEdit}</div>}
      </div>
    </div>
  );
}
