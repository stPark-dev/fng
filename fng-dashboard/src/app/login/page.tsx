"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import LanguageSwitch from "@/components/LanguageSwitch";

export default function LoginPage() {
  const { t, fontClass } = useI18n();
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setError("Google 로그인에 실패했습니다.");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden vignette grain">
      {/* 배경 이미지 */}
      <Image
        src="/Fear&Greeed.png"
        alt="Fear & Greed Background"
        fill
        className="object-cover"
        priority
      />

      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* 언어 선택 */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitch />
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="dark-box p-8 w-full max-w-md blood-border">
          {/* 타이틀 */}
          <div className="text-center mb-8">
            <h1 className={`${fontClass} text-lg text-[#c4b59d] mb-2`}>
              로그인
            </h1>
            <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#8b0000] to-transparent mx-auto" />
          </div>

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label className={`${fontClass} text-xs text-[#8b7355] block mb-2`}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1a1512] border-2 border-[#3d2d1f] text-[#c4b59d] px-4 py-3 focus:border-[#8b0000] focus:outline-none transition-colors"
                placeholder="email@example.com"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className={`${fontClass} text-xs text-[#8b7355] block mb-2`}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1a1512] border-2 border-[#3d2d1f] text-[#c4b59d] px-4 py-3 focus:border-[#8b0000] focus:outline-none transition-colors"
                placeholder="비밀번호 입력"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className={`${fontClass} text-xs text-[#8b0000]`}>
                {error}
              </p>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="blood-btn w-full text-sm disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-[1px] bg-[#3d2d1f]" />
            <span className={`${fontClass} text-xs text-[#5c4033] px-4`}>
              또는
            </span>
            <div className="flex-1 h-[1px] bg-[#3d2d1f]" />
          </div>

          {/* Google 로그인 버튼 */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className={fontClass}>Google로 로그인</span>
          </button>

          {/* 비회원 입장 */}
          <Link href="/dashboard" className="block">
            <button className="dark-btn w-full text-sm">
              비회원 입장
            </button>
          </Link>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center">
            <p className={`${fontClass} text-xs text-[#5c4033] mb-2`}>
              계정이 없으신가요?
            </p>
            <Link
              href="/signup"
              className={`${fontClass} text-sm text-[#8b0000] hover:text-[#a00000] transition-colors`}
            >
              회원가입
            </Link>
          </div>

          {/* 홈으로 */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className={`${fontClass} text-xs text-[#5c4033] hover:text-[#8b0000] transition-colors`}
            >
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
