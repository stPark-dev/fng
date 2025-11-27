"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import ProfileModal from "@/components/ProfileModal";

export default function AuthButton() {
  const { user, loading, signOut } = useAuth();
  const { locale, fontClass } = useI18n();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-[#3d2d1f] animate-pulse" />;
  }

  if (user) {
    const userName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
    const userImage = user.user_metadata?.avatar_url || user.user_metadata?.picture;

    return (
      <>
        <div className="relative group">
          {/* 프로필 버튼 */}
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                width={32}
                height={32}
                className="rounded-full border-2 border-[#8b0000]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#8b0000] flex items-center justify-center text-white text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {/* 드롭다운 - hover로 표시 */}
          <div className="absolute top-full right-0 pt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-[101]">
            <div className="w-48 dark-box blood-border p-2 shadow-xl">
              <div className="px-3 py-2 border-b border-[#3d2d1f]">
                <p className={`${fontClass} text-base text-[#c4b59d] truncate`}>{userName}</p>
                <p className={`${fontClass} text-sm text-[#5c4033] truncate`}>{user.email}</p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className={`${fontClass} w-full text-left px-3 py-2 text-xs text-[#c4b59d] hover:bg-[#1a1512] transition-colors mt-1`}
              >
                {locale === "ko" ? "프로필 수정" : "Edit Profile"}
              </button>
              <button
                onClick={handleSignOut}
                className={`${fontClass} w-full text-left px-3 py-2 text-xs text-[#8b0000] hover:bg-[#1a1512] transition-colors`}
              >
                {locale === "ko" ? "로그아웃" : "Logout"}
              </button>
            </div>
          </div>
        </div>

        {/* 프로필 수정 모달 */}
        <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      </>
    );
  }

  return (
    <Link href="/login">
      <button className="dark-btn text-xs px-3 py-1">{locale === "ko" ? "로그인" : "Login"}</button>
    </Link>
  );
}
