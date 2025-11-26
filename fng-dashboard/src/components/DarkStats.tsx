"use client";

import { useState, useEffect } from "react";
import { FngDataPoint } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

function getDarkColor(value: number): string {
  if (value <= 20) return "#8b0000";
  if (value <= 40) return "#a04000";
  if (value <= 60) return "#8b7355";
  if (value <= 80) return "#6b8e23";
  return "#4a0080";
}

interface DarkStatsProps {
  yearHigh: FngDataPoint;
  yearLow: FngDataPoint;
}

export default function DarkStats({ yearHigh, yearLow }: DarkStatsProps) {
  const { t, locale, fontClass } = useI18n();
  const [quote, setQuote] = useState(t.quotes[0]);

  const getDarkLabel = (value: number): string => {
    if (value <= 20) return t.gauge.terror;
    if (value <= 40) return t.gauge.dread;
    if (value <= 60) return t.gauge.unease;
    if (value <= 80) return t.gauge.desire;
    return t.gauge.madness;
  };

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * t.quotes.length);
    setQuote(t.quotes[randomIndex]);
  }, [t.quotes]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* 1년 통계 */}
      <div className="dark-box p-6">
        <h2 className={`${fontClass} text-sm text-[#8b0000] mb-6`}>
          {t.stats.chroniclesOfYear}
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {/* 최고 */}
          <div className="text-center p-4 border border-[#3d2d1f] bg-[#0d0a08]">
            <div className={`${fontClass} text-xs text-[#5c4033] mb-2`}>
              {t.stats.peakMadness}
            </div>
            <div
              className={`${fontClass} text-3xl`}
              style={{
                color: getDarkColor(yearHigh.value),
                textShadow: `0 0 15px ${getDarkColor(yearHigh.value)}40`
              }}
            >
              {yearHigh.value}
            </div>
            <div
              className={`${fontClass} text-xs mt-2`}
              style={{ color: getDarkColor(yearHigh.value) }}
            >
              {getDarkLabel(yearHigh.value)}
            </div>
            <div className={`${fontClass} text-[10px] text-[#5c4033] mt-2`}>
              {formatDate(yearHigh.date)}
            </div>
          </div>

          {/* 최저 */}
          <div className="text-center p-4 border border-[#3d2d1f] bg-[#0d0a08]">
            <div className={`${fontClass} text-xs text-[#5c4033] mb-2`}>
              {t.stats.deepestTerror}
            </div>
            <div
              className={`${fontClass} text-3xl`}
              style={{
                color: getDarkColor(yearLow.value),
                textShadow: `0 0 15px ${getDarkColor(yearLow.value)}40`
              }}
            >
              {yearLow.value}
            </div>
            <div
              className={`${fontClass} text-xs mt-2`}
              style={{ color: getDarkColor(yearLow.value) }}
            >
              {getDarkLabel(yearLow.value)}
            </div>
            <div className={`${fontClass} text-[10px] text-[#5c4033] mt-2`}>
              {formatDate(yearLow.date)}
            </div>
          </div>
        </div>
      </div>

      {/* 어둠의 명언 */}
      <div className="dark-box p-6 border-[#4a0080] shadow-[0_0_15px_#4a008040,inset_0_0_15px_rgba(74,0,128,0.1)]">
        <div className="flex items-start gap-4">
          <div className="text-2xl flicker">🕯️</div>
          <div>
            <h3 className={`${fontClass} text-sm text-[#4a0080] mb-3`}>
              {t.stats.whispersFromVoid}
            </h3>
            <p className={`${fontClass} text-xs text-[#c4b59d] leading-relaxed`}>
              &quot;{quote.quote}&quot;
            </p>
            <p className={`${fontClass} text-[10px] text-[#5c4033] mt-3`}>
              — {quote.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
