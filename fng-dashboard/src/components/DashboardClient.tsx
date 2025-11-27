"use client";

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
      <h3 className={`${fontClass} text-base text-[#c03030] mb-3`}>{title}</h3>
      <p className={`${fontClass} text-sm text-[#b8a080] leading-relaxed`}>{text}</p>
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
      <header className="border-b-2 border-[#3d2d1f] bg-gradient-to-b from-[#1a1512] to-[#0d0a08] sticky top-0 z-50 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1
                className={`${fontClass} text-3xl md:text-lg text-[#e0d0b8] drop-shadow-[2px_2px_0px_#000] hover:text-[#c03030] transition-colors cursor-pointer`}
              >
                {t.header.title}
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              {/* 게시판 링크 */}
              <Link href="/board">
                <span
                  className={`${fontClass} text-sm text-[#a08060] hover:text-[#c03030] transition-colors`}
                >
                  {locale === "ko" ? "게시판" : "Board"}
                </span>
              </Link>
              <LanguageSwitch />
              <div className="text-right hidden sm:block">
                <p className={`${fontClass} text-xs text-[#907050]`}>{t.header.lastOffering}</p>
                <p className={`${fontClass} text-sm text-[#c09050]`}>{formatDate(current.date)}</p>
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
          <TomeBox title={t.info.theOracle} text={t.info.theOracleText} fontClass={fontClass} />
          <TomeBox title={t.info.aWarning} text={t.info.aWarningText} fontClass={fontClass} />
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t-2 border-[#4a3828] mt-12 bg-linear-to-t from-[#1a1512] to-[#0d0a08]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
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
