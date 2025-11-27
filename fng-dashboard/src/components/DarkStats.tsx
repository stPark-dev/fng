"use client";

import { useState, useEffect } from "react";
import { FngDataPoint } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

function getDarkColor(value: number): string {
  if (value <= 20) return "#ff4444";
  if (value <= 40) return "#ff8844";
  if (value <= 60) return "#ccaa66";
  if (value <= 80) return "#88bb44";
  return "#aa44ff";
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
    return date
      .toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      .toUpperCase();
  };

  return (
    <div className="dark-box p-6 h-full flex flex-col">
      {/* 1년 통계 */}
      <div className="flex-1">
        <h2 className={`${fontClass} text-base text-[#c03030] mb-6`}>{t.stats.chroniclesOfYear}</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* 최고 */}
          <div className="text-center p-4 border border-[#4a3828] bg-[#0d0a08]">
            <div className={`${fontClass} text-sm text-[#a08060] mb-2`}>{t.stats.peakMadness}</div>
            <div
              className={`${fontClass} text-4xl`}
              style={{
                color: getDarkColor(yearHigh.value),
                textShadow: `0 0 15px ${getDarkColor(yearHigh.value)}40`,
              }}
            >
              {yearHigh.value}
            </div>
            <div
              className={`${fontClass} text-sm mt-2`}
              style={{ color: getDarkColor(yearHigh.value) }}
            >
              {getDarkLabel(yearHigh.value)}
            </div>
            <div className={`${fontClass} text-xs text-[#907050] mt-2`}>
              {formatDate(yearHigh.date)}
            </div>
          </div>

          {/* 최저 */}
          <div className="text-center p-4 border border-[#4a3828] bg-[#0d0a08]">
            <div className={`${fontClass} text-sm text-[#a08060] mb-2`}>
              {t.stats.deepestTerror}
            </div>
            <div
              className={`${fontClass} text-4xl`}
              style={{
                color: getDarkColor(yearLow.value),
                textShadow: `0 0 15px ${getDarkColor(yearLow.value)}40`,
              }}
            >
              {yearLow.value}
            </div>
            <div
              className={`${fontClass} text-sm mt-2`}
              style={{ color: getDarkColor(yearLow.value) }}
            >
              {getDarkLabel(yearLow.value)}
            </div>
            <div className={`${fontClass} text-xs text-[#907050] mt-2`}>
              {formatDate(yearLow.date)}
            </div>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-[#4a3828] my-6" />

      {/* 투자 명언 */}
      <div className="flex items-start gap-4">
        <div className="text-2xl">💡</div>
        <div>
          <h3 className={`${fontClass} text-sm text-[#d4a574] mb-2`}>
            {t.stats.whispersFromVoid}
          </h3>
          <p className={`${fontClass} text-sm text-[#c4b59d] leading-relaxed`}>
            &quot;{quote.quote}&quot;
          </p>
          <p className={`${fontClass} text-xs text-[#a08060] mt-2`}>— {quote.author}</p>
        </div>
      </div>
    </div>
  );
}
