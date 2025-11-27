"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n-context";

interface DarkGaugeProps {
  value: number;
  classification: string;
  change?: number;
}

function getDarkColor(value: number): string {
  if (value <= 20) return "#ff4444";
  if (value <= 40) return "#ff8844";
  if (value <= 60) return "#ccaa66";
  if (value <= 80) return "#88bb44";
  return "#aa44ff";
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
    <div className="dark-box p-6 blood-border h-full flex flex-col">
      <h2 className={`${fontClass} text-base text-[#c03030] mb-6 text-center`}>
        {t.gauge.soulStatus}
      </h2>

      {/* 숫자 표시 */}
      <div className="text-center mb-6 flex-1 flex flex-col justify-center">
        <div
          className={`${fontClass} text-6xl md:text-7xl`}
          style={{
            color,
            textShadow: `0 0 30px ${color}, 0 0 60px ${color}40`,
          }}
        >
          {displayValue}
        </div>
        <div className={`${fontClass} text-2xl mt-4`} style={{ color }}>
          {label}
        </div>
        <div className={`${fontClass} text-sm text-[#907050] mt-2`}>{classification}</div>
      </div>

      {/* 다크 판타지 체력바 */}
      <div className="mb-6">
        <div className="flex justify-center gap-1">
          {Array.from({ length: bars }).map((_, i) => {
            const barColor =
              i < 2
                ? "#ff4444"
                : i < 4
                ? "#ff8844"
                : i < 6
                ? "#ccaa66"
                : i < 8
                ? "#88bb44"
                : "#aa44ff";
            const isFilled = i < filledBars;
            return (
              <div
                key={i}
                className="w-6 h-8 border-2 transition-all duration-300"
                style={{
                  borderColor: "#4a3828",
                  backgroundColor: isFilled ? barColor : "#1a1512",
                  boxShadow: isFilled ? `0 0 10px ${barColor}` : "inset 0 0 5px rgba(0,0,0,0.5)",
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-3 px-1">
          <span className={`${fontClass} text-sm text-[#ff4444]`}>{t.gauge.fear}</span>
          <span className={`${fontClass} text-sm text-[#aa44ff]`}>{t.gauge.greed}</span>
        </div>
      </div>

      {/* 변동폭 */}
      {change !== undefined && (
        <div className="text-center border-t border-[#4a3828] pt-4">
          <span className={`${fontClass} text-sm text-[#907050]`}>{t.gauge.sinceYesterday} </span>
          <span
            className={`${fontClass} text-lg`}
            style={{ color: change > 0 ? "#88bb44" : change < 0 ? "#ff4444" : "#907050" }}
          >
            {change > 0 ? "+" : ""}
            {change}
          </span>
        </div>
      )}

      {/* 범례 */}
      <div className="mt-6 grid grid-cols-5 gap-1 text-center">
        {[
          { label: t.gauge.terror, color: "#ff4444" },
          { label: t.gauge.dread, color: "#ff8844" },
          { label: t.gauge.unease, color: "#ccaa66" },
          { label: t.gauge.desire, color: "#88bb44" },
          { label: t.gauge.madness, color: "#aa44ff" },
        ].map(({ label, color }) => (
          <div key={label}>
            <div className="w-full h-3 mb-1" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }} />
            <span className={`${fontClass} text-xs text-[#a08060]`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
