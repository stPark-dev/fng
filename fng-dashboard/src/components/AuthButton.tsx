"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";

export default function AuthButton() {
  const { user, loading, signOut } = useAuth();
  const { fontClass } = useI18n();
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#3d2d1f] animate-pulse" />
    );
  }

  if (user) {
    const userName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
    const userImage = user.user_metadata?.avatar_url || user.user_metadata?.picture;

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
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

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 dark-box blood-border z-50 p-2">
              <div className="px-3 py-2 border-b border-[#3d2d1f]">
                <p className={`${fontClass} text-xs text-[#c4b59d] truncate`}>
                  {userName}
                </p>
                <p className={`${fontClass} text-[10px] text-[#5c4033] truncate`}>
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setShowDropdown(false);
                }}
                className={`${fontClass} w-full text-left px-3 py-2 text-xs text-[#8b0000] hover:bg-[#1a1512] transition-colors mt-1`}
              >
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Link href="/login">
      <button className="dark-btn text-xs px-3 py-1">
        로그인
      </button>
    </Link>
  );
}
