"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import LanguageSwitch from "@/components/LanguageSwitch";

export default function LandingPage() {
  const { t, fontClass } = useI18n();

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
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* 언어 선택 */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitch />
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-20 flex flex-col items-center justify-between min-h-screen p-8">
        {/* 상단 타이틀 */}
        <div className="text-center mt-12">
          <h1 className={`${fontClass} text-xl md:text-3xl text-[#c4b59d] drop-shadow-[2px_2px_0px_#000] shake`}>
            {t.landing.title}
          </h1>
          <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#8b0000] to-transparent mx-auto my-4" />
          <p className={`${fontClass} text-xs md:text-sm text-[#8b4513] tracking-widest`}>
            {t.landing.subtitle}
          </p>
        </div>

        {/* 중앙 - 분위기 있는 텍스트 */}
        <div className="text-center my-8">
          <p className={`${fontClass} text-xs text-[#666] leading-loose max-w-md`}>
            {t.landing.inTheDepths}
            <br />
            {t.landing.whereHopeDies}
            <br />
            <span className="text-[#8b0000]">{t.landing.willYouSurvive}</span>
          </p>
        </div>

        {/* 하단 로그인/회원가입 */}
        <div className="dark-box p-8 mb-12 w-full max-w-md blood-border">
          <div className="text-center mb-8">
            <p className={`${fontClass} text-[#8b0000] text-sm mb-3 flicker`}>
              {t.landing.enterDungeon}
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-[#8b0000] flicker" style={{ animationDelay: "0s" }} />
              <div className="w-2 h-2 bg-[#8b0000] flicker" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-[#8b0000] flicker" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>

          <div className="space-y-4">
            <Link href="/dashboard" className="block">
              <button className="blood-btn w-full text-sm md:text-base">
                {t.landing.descend}
              </button>
            </Link>

            <div className="flex gap-4">
              <Link href="/login" className="flex-1">
                <button className="dark-btn w-full text-xs">
                  {t.landing.signIn}
                </button>
              </Link>
              <Link href="/signup" className="flex-1">
                <button className="dark-btn w-full text-xs">
                  {t.landing.join}
                </button>
              </Link>
            </div>
          </div>

          {/* 경고 문구 */}
          <div className="mt-8 text-center">
            <p className={`${fontClass} text-[10px] text-[#5c4033] leading-relaxed`}>
              {t.landing.warning}
              <br />
              {t.landing.manyEntered}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#3d2d1f] text-center">
            <a
              href="https://github.com/stPark-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${fontClass} text-xs text-[#5c4033] hover:text-[#8b0000] transition-colors`}
            >
              ☠ GITHUB ☠
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
