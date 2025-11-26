"use client";

import { useEffect, useState } from "react";
import { getIndexColor, getIndexLabelKo } from "@/lib/api";

interface RetroGaugeProps {
  value: number;
  classification: string;
  change?: number;
}

export default function RetroGauge({ value, classification, change }: RetroGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // 숫자 카운트업 애니메이션
    let current = 0;
    const step = value / 30;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  const color = getIndexColor(value);
  const label = getIndexLabelKo(value);

  // 레벨 바 계산
  const bars = 10;
  const filledBars = Math.floor((value / 100) * bars);

  return (
    <div className="retro-box p-6">
      <h2 className="font-[family-name:var(--font-retro)] text-[10px] text-[#00ffff] mb-6 text-center">
        TODAY&apos;S INDEX
      </h2>

      {/* 큰 숫자 표시 */}
      <div className="text-center mb-6">
        <div
          className="font-[family-name:var(--font-retro)] text-6xl md:text-7xl drop-shadow-[0_0_20px_currentColor]"
          style={{ color }}
        >
          {displayValue}
        </div>
        <div
          className="font-[family-name:var(--font-retro)] text-sm mt-4"
          style={{ color }}
        >
          {label}
        </div>
        <div className="font-[family-name:var(--font-retro)] text-[8px] text-gray-500 mt-2">
          {classification}
        </div>
      </div>

      {/* 레트로 레벨 바 */}
      <div className="flex justify-center gap-1 mb-6">
        {Array.from({ length: bars }).map((_, i) => {
          const barColor = i < 2 ? "#ea3943" : i < 4 ? "#ea8c00" : i < 6 ? "#f5d100" : i < 8 ? "#93d900" : "#16c784";
          return (
            <div
              key={i}
              className="w-6 h-8 border-2 transition-all duration-300"
              style={{
                borderColor: barColor,
                backgroundColor: i < filledBars ? barColor : "transparent",
                boxShadow: i < filledBars ? `0 0 10px ${barColor}` : "none",
              }}
            />
          );
        })}
      </div>

      {/* 변동폭 */}
      {change !== undefined && (
        <div className="text-center">
          <span className="font-[family-name:var(--font-retro)] text-[10px] text-gray-500">
            VS YESTERDAY:{" "}
          </span>
          <span
            className="font-[family-name:var(--font-retro)] text-[12px]"
            style={{ color: change > 0 ? "#16c784" : change < 0 ? "#ea3943" : "#888" }}
          >
            {change > 0 ? "+" : ""}
            {change}
          </span>
        </div>
      )}

      {/* 범례 */}
      <div className="mt-6 grid grid-cols-5 gap-1 text-center">
        {[
          { label: "FEAR", color: "#ea3943" },
          { label: "WORRY", color: "#ea8c00" },
          { label: "NEUT", color: "#f5d100" },
          { label: "GREED", color: "#93d900" },
          { label: "MAX", color: "#16c784" },
        ].map(({ label, color }) => (
          <div key={label}>
            <div className="w-full h-2 mb-1" style={{ backgroundColor: color }} />
            <span className="font-[family-name:var(--font-retro)] text-[6px] text-gray-500">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
