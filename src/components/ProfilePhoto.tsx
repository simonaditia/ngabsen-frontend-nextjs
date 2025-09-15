import React, { useRef, useState } from "react";

interface ProfilePhotoProps {
  photoUrl: string;
  onPhotoChange?: (file: File) => void;
  loading?: boolean;
}

export default function ProfilePhoto({ photoUrl, onPhotoChange, loading }: ProfilePhotoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(photoUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoChange) {
      setPreview(URL.createObjectURL(file));
      onPhotoChange(file);
    }
  };

  // Jika tidak ada onPhotoChange, hanya tampilkan foto
  if (!onPhotoChange) {
    return (
      <img
        src={preview}
        alt="Profile"
        className="w-14 h-14 rounded-full object-cover"
      />
    );
  }
  // Jika ada onPhotoChange, tampilkan foto dan tombol edit
  return (
    <div className="flex items-center gap-4">
      <img
        src={preview}
        alt="Profile"
        className="w-20 h-20 rounded-full object-cover"
      />
      <button
        className="bg-gray-200 px-2 py-1 rounded text-sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >{loading ? "Uploading..." : "Edit Photo"}</button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
