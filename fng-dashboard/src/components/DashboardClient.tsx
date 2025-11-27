"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import LanguageSwitch from "@/components/LanguageSwitch";
import AuthButton from "@/components/AuthButton";
import DarkGauge from "@/components/DarkGauge";
import DarkChart from "@/components/DarkChart";
import DarkStats from "@/components/DarkStats";
import Link from "next/link";
import { FngDataPoint } from "@/lib/api";

interface DashboardClientProps {
  current: FngDataPoint;
  change: number;
  yearHigh: FngDataPoint;
  yearLow: FngDataPoint;
  data30d: FngDataPoint[];
  data1y: FngDataPoint[];
  data2y: FngDataPoint[];
}

function TomeBox({ title, text, fontClass }: { title: string; text: string; fontClass: string }) {
  return (
    <div className="dark-box p-5">
      <h3 className={`${fontClass} text-base text-[#c03030] mb-3`}>
        {title}
      </h3>
      <p className={`${fontClass} text-sm text-[#b8a080] leading-relaxed`}>
        {text}
      </p>
    </div>
  );
}

export default function DashboardClient({
  current,
  change,
  yearHigh,
  yearLow,
  data30d,
  data1y,
  data2y,
}: DashboardClientProps) {
  const { t, locale, fontClass } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio("/sound/Ancient_City.ogg.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const playAudio = () => {
      audio.play().catch(() => {});
    };

    // 사용자 인터랙션 후 재생 시도
    playAudio();
    document.addEventListener("click", playAudio, { once: true });

    return () => {
      audio.pause();
      audio.src = "";
      document.removeEventListener("click", playAudio);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0a08] relative vignette grain">
      {/* 헤더 */}
      <header className="border-b-2 border-[#3d2d1f] bg-gradient-to-b from-[#1a1512] to-[#0d0a08] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className={`${fontClass} text-base md:text-lg text-[#e0d0b8] drop-shadow-[2px_2px_0px_#000] hover:text-[#c03030] transition-colors cursor-pointer`}>
                {t.header.title}
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className="text-[#a08060] hover:text-[#e0d0b8] transition-colors p-2"
                title={isMuted ? "음악 켜기" : "음악 끄기"}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              <LanguageSwitch />
              <div className="text-right hidden sm:block">
                <p className={`${fontClass} text-xs text-[#907050]`}>
                  {t.header.lastOffering}
                </p>
                <p className={`${fontClass} text-sm text-[#c09050]`}>
                  {formatDate(current.date)}
                </p>
              </div>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* 상단: 게이지 + 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <DarkGauge
              value={current.value}
              classification={current.value_classification}
              change={change}
            />
          </div>
          <div className="lg:col-span-2">
            <DarkStats yearHigh={yearHigh} yearLow={yearLow} />
          </div>
        </div>

        {/* 차트 */}
        <DarkChart data30d={data30d} data1y={data1y} data2y={data2y} />

        {/* 하단 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <TomeBox
            title={t.info.whatIsThisCurse}
            text={t.info.whatIsThisCurseText}
            fontClass={fontClass}
          />
          <TomeBox
            title={t.info.theOracle}
            text={t.info.theOracleText}
            fontClass={fontClass}
          />
          <TomeBox
            title={t.info.aWarning}
            text={t.info.aWarningText}
            fontClass={fontClass}
          />
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t-2 border-[#4a3828] mt-12 bg-gradient-to-t from-[#1a1512] to-[#0d0a08]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <p className={`${fontClass} text-sm text-[#907050]`}>
              {t.footer.dataExtracted}
            </p>
            <a
              href="https://github.com/stPark-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${fontClass} text-base text-[#c09050] hover:text-[#c03030] transition-colors`}
            >
              ☠ GITHUB ☠
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
