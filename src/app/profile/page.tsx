"use client";
import { useProfile } from "@/hooks/useProfile";
import { useState, useRef, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { listenFCMMessages } from "@/firebase/firebaseInit";
import { requestDeviceToken } from "@/firebase/firebaseInit";
import ProfilePhoto from "@/components/ProfilePhoto";

export default function ProfilePage() {
  const [notifError, setNotifError] = useState("");
  useEffect(() => {
    async function registerDeviceToken() {
      const token = await requestDeviceToken();
      if (token) {
        // Kirim deviceToken ke backend
        try {
          await api.post("/employees/device-token", { deviceToken: token });
          console.log("Device token sent to backend:", token);
        } catch (err) {
          setNotifError("Gagal mengirim device token ke backend.");
          console.error("Failed to send device token:", err);
        }
      } else {
        setNotifError("Izin notifikasi browser diblokir atau gagal mendapatkan device token. Aktifkan notifikasi di browser!");
        console.warn("No device token received from FCM");
      }
    }
    registerDeviceToken();
  }, []);
  useEffect(() => {
    listenFCMMessages((payload) => {
      console.log("FCM message received:", payload);
    });
  }, []);
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
  const { profile, loading: profileLoading, error } = useProfile(0);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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

  if (profileLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Validasi sederhana
  const validate = () => {
    if (!/^08[0-9]{8,11}$/.test(phone)) return "Nomor HP tidak valid";
    if (password && password.length < 6) return "Password minimal 6 karakter";
    return "";
  };

  const handlePhotoChange = async (file: File) => {
    setUploadingPhoto(true);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.patch("/employees/profile-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const photoUrl = (res.data && typeof res.data === "object" && "photoUrl" in res.data) ? (res.data as any).photoUrl : undefined;
      if (photoUrl) {
        setPhotoPreview(photoUrl);
        setSuccessEdit("Foto profile berhasil diupdate!");
      }
    } catch {
      setErrorEdit("Gagal upload foto profile");
    } finally {
      setUploadingPhoto(false);
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
      {notifError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {notifError}
        </div>
      )}
      <div className="bg-white rounded shadow p-6 flex flex-col gap-4">
        <ProfilePhoto
          photoUrl={photoPreview || profile?.photoUrl || "https://upload.wikimedia.org/wikipedia/commons/f/fd/Mysterious_profile_%282013%3B_cropped_2023%29.jpg" } //|| "/next.svg"
          onPhotoChange={handlePhotoChange}
          loading={uploadingPhoto}
        />
        <div>
          <div className="font-semibold text-lg">{profile?.name}</div>
          <div className="text-gray-500">{profile?.email}</div>
          <div className="text-gray-500">{profile?.position}</div>
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
