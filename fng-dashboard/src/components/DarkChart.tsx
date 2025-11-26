"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { FngDataPoint } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

interface DarkChartProps {
  data30d: FngDataPoint[];
  data1y: FngDataPoint[];
  data2y: FngDataPoint[];
}

type Period = "30d" | "1y" | "2y";

function getDarkColor(value: number): string {
  if (value <= 20) return "#8b0000";
  if (value <= 40) return "#a04000";
  if (value <= 60) return "#8b7355";
  if (value <= 80) return "#6b8e23";
  return "#4a0080";
}

export default function DarkChart({ data30d, data1y, data2y }: DarkChartProps) {
  const [period, setPeriod] = useState<Period>("30d");
  const { t, locale, fontClass } = useI18n();

  const periodData = {
    "30d": data30d,
    "1y": data1y,
    "2y": data2y,
  };

  const data = periodData[period];

  const chartData = [...data].reverse().map((item) => ({
    date:
      period === "30d"
        ? item.date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", { month: "short", day: "numeric" })
        : item.date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", { year: "2-digit", month: "short" }),
    fullDate: item.date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    value: item.value,
    classification: item.value_classification,
  }));

  const getDarkLabel = (value: number): string => {
    if (value <= 20) return t.gauge.terror;
    if (value <= 40) return t.gauge.dread;
    if (value <= 60) return t.gauge.unease;
    if (value <= 80) return t.gauge.desire;
    return t.gauge.madness;
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: (typeof chartData)[0] }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = getDarkColor(data.value);

      return (
        <div className="dark-box p-3 blood-border">
          <p className={`${fontClass} text-[10px] text-[#5c4033]`}>
            {data.fullDate}
          </p>
          <p
            className={`${fontClass} text-xl mt-1`}
            style={{ color, textShadow: `0 0 10px ${color}` }}
          >
            {data.value}
          </p>
          <p
            className={`${fontClass} text-xs mt-1`}
            style={{ color }}
          >
            {getDarkLabel(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const periodButtons = [
    { key: "30d" as Period, label: t.chart.days30 },
    { key: "1y" as Period, label: t.chart.year1 },
    { key: "2y" as Period, label: t.chart.years2 },
  ];

  return (
    <div className="dark-box p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`${fontClass} text-sm text-[#8b0000]`}>
          {t.chart.cursedTimeline}
        </h2>

        <div className="flex gap-2">
          {periodButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`${fontClass} text-xs px-3 py-1 border-2 transition-all ${
                period === key
                  ? "border-[#8b0000] bg-[#8b0000] text-[#ffd4d4] shadow-[0_0_10px_#8b000080]"
                  : "border-[#3d2d1f] text-[#5c4033] hover:border-[#8b0000] hover:text-[#8b0000]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d1f14" />

            <XAxis
              dataKey="date"
              stroke="#3d2d1f"
              tick={{ fill: "#5c4033", fontSize: 9, fontFamily: "monospace" }}
              tickLine={{ stroke: "#3d2d1f" }}
              interval={period === "30d" ? 4 : period === "1y" ? 30 : 60}
            />

            <YAxis
              domain={[0, 100]}
              stroke="#3d2d1f"
              tick={{ fill: "#5c4033", fontSize: 9, fontFamily: "monospace" }}
              tickLine={{ stroke: "#3d2d1f" }}
              ticks={[0, 20, 40, 60, 80, 100]}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 구간 참조선 */}
            <ReferenceLine y={20} stroke="#8b0000" strokeDasharray="5 5" strokeOpacity={0.4} />
            <ReferenceLine y={50} stroke="#8b7355" strokeDasharray="5 5" strokeOpacity={0.3} />
            <ReferenceLine y={80} stroke="#4a0080" strokeDasharray="5 5" strokeOpacity={0.4} />

            {/* 메인 라인 - 피 색상 */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b0000"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 6,
                fill: "#8b0000",
                stroke: "#ffd4d4",
                strokeWidth: 2,
              }}
              style={{
                filter: "drop-shadow(0 0 6px #8b0000)",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-8 mt-4">
        {[
          { label: t.chart.terrorZone, color: "#8b0000", value: "0-20" },
          { label: t.chart.neutralVoid, color: "#8b7355", value: "40-60" },
          { label: t.chart.madnessRealm, color: "#4a0080", value: "80-100" },
        ].map(({ label, color, value }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3"
              style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}
            />
            <span className={`${fontClass} text-[10px] text-[#5c4033]`}>
              {label} ({value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
