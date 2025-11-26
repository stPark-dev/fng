"use client";

import { useState, useEffect } from "react";
import { FngDataPoint, getIndexColor, getIndexLabelKo } from "@/lib/api";

const INVESTMENT_TIPS = [
  { quote: "BUY WHEN THERE'S BLOOD IN THE STREETS", author: "ROTHSCHILD" },
  { quote: "BE FEARFUL WHEN OTHERS ARE GREEDY", author: "BUFFETT" },
  { quote: "THE MARKET IS A VOTING MACHINE SHORT TERM", author: "GRAHAM" },
  { quote: "COMPOUND INTEREST IS THE 8TH WONDER", author: "EINSTEIN" },
  { quote: "THIS TIME IS DIFFERENT - DANGEROUS WORDS", author: "TEMPLETON" },
  { quote: "PATIENCE TRANSFERS MONEY FROM IMPATIENT", author: "BUFFETT" },
  { quote: "PRICE IS WHAT YOU PAY, VALUE IS WHAT YOU GET", author: "BUFFETT" },
  { quote: "RULE 1: NEVER LOSE MONEY", author: "BUFFETT" },
  { quote: "DON'T FOLLOW THE CROWD", author: "KOSTOLANY" },
  { quote: "BUYING A STOCK IS BUYING A BUSINESS", author: "GRAHAM" },
  { quote: "BEAR MARKETS ARE OPPORTUNITIES", author: "LYNCH" },
  { quote: "TIME IN MARKET > TIMING THE MARKET", author: "FISHER" },
  { quote: "INVESTING IS A MARATHON NOT A SPRINT", author: "LYNCH" },
  { quote: "EMOTIONS ARE THE ENEMY OF INVESTING", author: "GRAHAM" },
  { quote: "DYOR - DO YOUR OWN RESEARCH", author: "CRYPTO WISDOM" },
];

interface RetroStatsProps {
  yearHigh: FngDataPoint;
  yearLow: FngDataPoint;
}

export default function RetroStats({ yearHigh, yearLow }: RetroStatsProps) {
  const [tip, setTip] = useState(INVESTMENT_TIPS[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * INVESTMENT_TIPS.length);
    setTip(INVESTMENT_TIPS[randomIndex]);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
      day: "numeric",
    }).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* 1년 통계 */}
      <div className="retro-box p-6">
        <h2 className="font-[family-name:var(--font-retro)] text-[10px] text-[#00ffff] mb-6">
          YEARLY STATS
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {/* 최고 */}
          <div className="text-center">
            <div className="font-[family-name:var(--font-retro)] text-[8px] text-gray-500 mb-2">
              HIGH SCORE
            </div>
            <div
              className="font-[family-name:var(--font-retro)] text-4xl drop-shadow-[0_0_15px_currentColor]"
              style={{ color: getIndexColor(yearHigh.value) }}
            >
              {yearHigh.value}
            </div>
            <div
              className="font-[family-name:var(--font-retro)] text-[8px] mt-2"
              style={{ color: getIndexColor(yearHigh.value) }}
            >
              {getIndexLabelKo(yearHigh.value)}
            </div>
            <div className="font-[family-name:var(--font-retro)] text-[8px] text-gray-600 mt-1">
              {formatDate(yearHigh.date)}
            </div>
          </div>

          {/* 최저 */}
          <div className="text-center">
            <div className="font-[family-name:var(--font-retro)] text-[8px] text-gray-500 mb-2">
              LOW SCORE
            </div>
            <div
              className="font-[family-name:var(--font-retro)] text-4xl drop-shadow-[0_0_15px_currentColor]"
              style={{ color: getIndexColor(yearLow.value) }}
            >
              {yearLow.value}
            </div>
            <div
              className="font-[family-name:var(--font-retro)] text-[8px] mt-2"
              style={{ color: getIndexColor(yearLow.value) }}
            >
              {getIndexLabelKo(yearLow.value)}
            </div>
            <div className="font-[family-name:var(--font-retro)] text-[8px] text-gray-600 mt-1">
              {formatDate(yearLow.date)}
            </div>
          </div>
        </div>
      </div>

      {/* 투자 팁 */}
      <div className="retro-box p-6 border-[#ff00ff] shadow-[0_0_10px_#ff00ff,inset_0_0_10px_rgba(255,0,255,0.1)]">
        <div className="flex items-start gap-4">
          <div className="text-2xl blink">💎</div>
          <div>
            <h3 className="font-[family-name:var(--font-retro)] text-[10px] text-[#ff00ff] mb-2">
              WISDOM
            </h3>
            <p className="font-[family-name:var(--font-retro)] text-[8px] text-gray-300 leading-relaxed">
              &quot;{tip.quote}&quot;
            </p>
            <p className="font-[family-name:var(--font-retro)] text-[8px] text-gray-500 mt-2">
              - {tip.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
