"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 이미지를 WebP로 변환하는 함수
async function convertToWebP(file: File, maxWidth: number = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      // 비율 유지하면서 리사이즈
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert image to WebP"));
            }
          },
          "image/webp",
          0.8 // 품질 80%
        );
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { fontClass } = useI18n();
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 유저 정보로 초기화
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || user.email?.split("@")[0] || "");
      setPreviewUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);
    }
  }, [user]);

  // 모달 닫힐 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

      // 이미지 업로드
      if (selectedFile) {
        // WebP로 변환
        const webpBlob = await convertToWebP(selectedFile);
        const fileName = `${user.id}/${Date.now()}.webp`;

        // Supabase Storage에 업로드
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, webpBlob, {
            contentType: "image/webp",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
        }

        // Public URL 가져오기
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);

        avatarUrl = urlData.publicUrl;
      }

      // 유저 메타데이터 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: name,
          avatar_url: avatarUrl,
        },
      });

      if (updateError) {
        throw new Error(`프로필 업데이트 실패: ${updateError.message}`);
      }

      setSuccess("프로필이 업데이트되었습니다.");
      setTimeout(() => {
        onClose();
        window.location.reload(); // 프로필 반영을 위해 새로고침
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 */}
      <div className="relative dark-box blood-border p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#907050] hover:text-[#c03030] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 타이틀 */}
        <div className="text-center mb-6">
          <h2 className={`${fontClass} text-lg text-[#e0d0b8]`}>프로필 수정</h2>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#c03030] to-transparent mx-auto mt-2" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#4a3828] cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <Image src={previewUrl} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-[#c03030] flex items-center justify-center text-white text-3xl">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* 오버레이 */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className={`${fontClass} text-xs text-[#907050] mt-2`}>클릭하여 이미지 변경</p>
          </div>

          {/* 이름 */}
          <div>
            <label className={`${fontClass} text-sm text-[#a08060] block mb-2`}>이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a1512] border-2 border-[#4a3828] text-[#e0d0b8] px-4 py-3 focus:border-[#c03030] focus:outline-none transition-colors"
              placeholder="이름 입력"
            />
          </div>

          {/* 이메일 (읽기 전용) */}
          <div>
            <label className={`${fontClass} text-sm text-[#a08060] block mb-2`}>이메일</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full bg-[#0d0a08] border-2 border-[#3a2a1a] text-[#907050] px-4 py-3 cursor-not-allowed"
            />
            <p className={`${fontClass} text-xs text-[#5a4a3a] mt-1`}>
              이메일은 변경할 수 없습니다.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && <p className={`${fontClass} text-sm text-[#ff4444]`}>{error}</p>}

          {/* 성공 메시지 */}
          {success && <p className={`${fontClass} text-sm text-[#88bb44]`}>{success}</p>}

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="dark-btn flex-1 text-sm"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="blood-btn flex-1 text-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
