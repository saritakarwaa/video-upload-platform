"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
  //authenticationEndpoint: "/api/imagekit-auth", // This route gives auth params
});


interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

export default function FileUpload({
  onSuccess,
  onProgress,
  fileType = "image",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video")) {
        setError("Please upload a valid video file");
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("Video size must be less than 100MB");
        return false;
      }
    } else {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or WebP)");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return false;
      }
    }
    return true;
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Get auth params from your backend
      const authRes = await fetch("http://localhost:3000/api/auth");
      const auth = await authRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", auth.publicKey);
      formData.append("signature", auth.signature);
      formData.append("expire", auth.expire);
      formData.append("token", auth.token);
      formData.append("folder", fileType === "video" ? "/videos" : "/images");
      formData.append("useUniqueFileName", "true");

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = (event.loaded / event.total) * 100;
          onProgress(Math.round(percent));
        }
      };

      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          setUploading(false);
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            onSuccess(response);
          } else {
            setError("Upload failed");
          }
        }
      };

      xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload", true);
      xhr.send(formData);
    } catch (err: any) {
      setUploading(false);
      setError("Something went wrong");
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        accept={fileType === "video" ? "video/*" : "image/*"}
        className="file-input file-input-bordered w-full"
        onChange={handleUpload}
      />

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}

      {error && <div className="text-error text-sm">{error}</div>}
    </div>
  );
}
