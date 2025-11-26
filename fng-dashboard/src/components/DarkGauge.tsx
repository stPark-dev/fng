"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n-context";

interface DarkGaugeProps {
  value: number;
  classification: string;
  change?: number;
}

function getDarkColor(value: number): string {
  if (value <= 20) return "#8b0000";
  if (value <= 40) return "#a04000";
  if (value <= 60) return "#8b7355";
  if (value <= 80) return "#6b8e23";
  return "#4a0080";
}

export default function DarkGauge({ value, classification, change }: DarkGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const { t, fontClass } = useI18n();

  const getDarkLabel = (val: number): string => {
    if (val <= 20) return t.gauge.terror;
    if (val <= 40) return t.gauge.dread;
    if (val <= 60) return t.gauge.unease;
    if (val <= 80) return t.gauge.desire;
    return t.gauge.madness;
  };

  useEffect(() => {
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

  const color = getDarkColor(value);
  const label = getDarkLabel(value);

  const bars = 10;
  const filledBars = Math.floor((value / 100) * bars);

  return (
    <div className="dark-box p-6 blood-border">
      <h2 className={`${fontClass} text-sm text-[#8b0000] mb-6 text-center`}>
        {t.gauge.soulStatus}
      </h2>

      {/* 숫자 표시 */}
      <div className="text-center mb-6">
        <div
          className={`${fontClass} text-5xl md:text-6xl`}
          style={{
            color,
            textShadow: `0 0 20px ${color}, 0 0 40px ${color}40`
          }}
        >
          {displayValue}
        </div>
        <div
          className={`${fontClass} text-sm mt-4`}
          style={{ color }}
        >
          {label}
        </div>
        <div className={`${fontClass} text-xs text-[#5c4033] mt-2`}>
          {classification}
        </div>
      </div>

      {/* 다크 판타지 체력바 */}
      <div className="mb-6">
        <div className="flex justify-center gap-[2px]">
          {Array.from({ length: bars }).map((_, i) => {
            const barColor = i < 2 ? "#8b0000" : i < 4 ? "#a04000" : i < 6 ? "#8b7355" : i < 8 ? "#6b8e23" : "#4a0080";
            const isFilled = i < filledBars;
            return (
              <div
                key={i}
                className="w-5 h-6 border transition-all duration-300"
                style={{
                  borderColor: "#3d2d1f",
                  backgroundColor: isFilled ? barColor : "#1a1512",
                  boxShadow: isFilled ? `0 0 8px ${barColor}` : "inset 0 0 5px rgba(0,0,0,0.5)",
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className={`${fontClass} text-[10px] text-[#8b0000]`}>{t.gauge.fear}</span>
          <span className={`${fontClass} text-[10px] text-[#4a0080]`}>{t.gauge.greed}</span>
        </div>
      </div>

      {/* 변동폭 */}
      {change !== undefined && (
        <div className="text-center border-t border-[#3d2d1f] pt-4">
          <span className={`${fontClass} text-xs text-[#5c4033]`}>
            {t.gauge.sinceYesterday}{" "}
          </span>
          <span
            className={`${fontClass} text-sm`}
            style={{ color: change > 0 ? "#6b8e23" : change < 0 ? "#8b0000" : "#5c4033" }}
          >
            {change > 0 ? "+" : ""}
            {change}
          </span>
        </div>
      )}

      {/* 범례 */}
      <div className="mt-6 grid grid-cols-5 gap-1 text-center">
        {[
          { label: t.gauge.terror, color: "#8b0000" },
          { label: t.gauge.dread, color: "#a04000" },
          { label: t.gauge.unease, color: "#8b7355" },
          { label: t.gauge.desire, color: "#6b8e23" },
          { label: t.gauge.madness, color: "#4a0080" },
        ].map(({ label, color }) => (
          <div key={label}>
            <div className="w-full h-2 mb-1" style={{ backgroundColor: color }} />
            <span className={`${fontClass} text-[9px] text-[#5c4033]`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
