"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import LanguageSwitch from "@/components/LanguageSwitch";

export default function SignUpPage() {
  const { t, fontClass } = useI18n();
  const { signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
              회원가입
            </h1>
            <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#8b0000] to-transparent mx-auto" />
          </div>

          {success ? (
            <div className="text-center">
              <p className={`${fontClass} text-sm text-green-500 mb-4`}>
                회원가입이 완료되었습니다!
              </p>
              <p className={`${fontClass} text-xs text-[#5c4033]`}>
                로그인 페이지로 이동합니다...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이름 */}
              <div>
                <label className={`${fontClass} text-xs text-[#8b7355] block mb-2`}>
                  이름 (선택)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1a1512] border-2 border-[#3d2d1f] text-[#c4b59d] px-4 py-3 focus:border-[#8b0000] focus:outline-none transition-colors"
                  placeholder="홍길동"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className={`${fontClass} text-xs text-[#8b7355] block mb-2`}>
                  이메일 *
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
                  비밀번호 *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#1a1512] border-2 border-[#3d2d1f] text-[#c4b59d] px-4 py-3 focus:border-[#8b0000] focus:outline-none transition-colors"
                  placeholder="최소 6자 이상"
                />
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className={`${fontClass} text-xs text-[#8b7355] block mb-2`}>
                  비밀번호 확인 *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#1a1512] border-2 border-[#3d2d1f] text-[#c4b59d] px-4 py-3 focus:border-[#8b0000] focus:outline-none transition-colors"
                  placeholder="비밀번호 재입력"
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <p className={`${fontClass} text-xs text-[#8b0000]`}>
                  {error}
                </p>
              )}

              {/* 회원가입 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="blood-btn w-full text-sm disabled:opacity-50"
              >
                {loading ? "가입 중..." : "회원가입"}
              </button>
            </form>
          )}

          {/* 구분선 */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-[1px] bg-[#3d2d1f]" />
            <span className={`${fontClass} text-xs text-[#5c4033] px-4`}>
              또는
            </span>
            <div className="flex-1 h-[1px] bg-[#3d2d1f]" />
          </div>

          {/* 로그인으로 */}
          <div className="text-center">
            <p className={`${fontClass} text-xs text-[#5c4033] mb-4`}>
              이미 계정이 있으신가요?
            </p>
            <Link href="/login">
              <button className="dark-btn w-full text-sm">
                로그인
              </button>
            </Link>
          </div>

          {/* 홈으로 */}
          <div className="mt-6 text-center">
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
