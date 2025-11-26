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
  Area,
  ComposedChart,
} from "recharts";
import { FngDataPoint, getIndexColor } from "@/lib/api";

interface FngLineChartProps {
  data30d: FngDataPoint[];
  data1y: FngDataPoint[];
  data2y: FngDataPoint[];
}

type Period = "30d" | "1y" | "2y";

export default function FngLineChart({ data30d, data1y, data2y }: FngLineChartProps) {
  const [period, setPeriod] = useState<Period>("30d");

  const periodData = {
    "30d": data30d,
    "1y": data1y,
    "2y": data2y,
  };

  const data = periodData[period];

  // 차트용 데이터 포맷
  const chartData = [...data].reverse().map((item) => ({
    date:
      period === "30d"
        ? item.date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
        : item.date.toLocaleDateString("ko-KR", {
            year: "2-digit",
            month: "short",
            day: "numeric",
          }),
    fullDate: item.date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    value: item.value,
    classification: item.value_classification,
  }));

  // 커스텀 툴팁
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: (typeof chartData)[0] }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = getIndexColor(data.value);

      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-sm">{data.fullDate}</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {data.value}
          </p>
          <p className="text-sm" style={{ color }}>
            {data.classification}
          </p>
        </div>
      );
    }
    return null;
  };

  // 그라데이션을 위한 색상 구간 계산
  const getGradientOffset = () => {
    const dataMax = Math.max(...chartData.map((d) => d.value));
    const dataMin = Math.min(...chartData.map((d) => d.value));

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">공포 & 탐욕 지수 추이</h2>

        {/* 기간 선택 버튼 */}
        <div className="flex gap-2">
          {[
            { key: "30d", label: "30일" },
            { key: "1y", label: "1년" },
            { key: "2y", label: "2년" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key as Period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16c784" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#f5d100" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#ea3943" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={{ stroke: "#4b5563" }}
              interval={period === "30d" ? 4 : period === "1y" ? 30 : period === "2y" ? 60 : 90}
            />

            <YAxis
              domain={[0, 100]}
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={{ stroke: "#4b5563" }}
              ticks={[0, 25, 50, 75, 100]}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 구간 표시 참조선 */}
            <ReferenceLine y={20} stroke="#ea3943" strokeDasharray="5 5" strokeOpacity={0.5} />
            <ReferenceLine y={40} stroke="#ea8c00" strokeDasharray="5 5" strokeOpacity={0.5} />
            <ReferenceLine y={60} stroke="#f5d100" strokeDasharray="5 5" strokeOpacity={0.5} />
            <ReferenceLine y={80} stroke="#93d900" strokeDasharray="5 5" strokeOpacity={0.5} />

            {/* 영역 채우기 */}
            <Area type="monotone" dataKey="value" stroke="none" fill="url(#colorValue)" />

            {/* 라인 */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 6,
                fill: "#60a5fa",
                stroke: "#1e3a5f",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 구간 범례 */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-[#ea3943]" style={{ borderTop: "2px dashed #ea3943" }} />
          <span className="text-gray-400">극단적 공포 (0-20)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-[#f5d100]" style={{ borderTop: "2px dashed #f5d100" }} />
          <span className="text-gray-400">중립 (40-60)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-[#16c784]" style={{ borderTop: "2px dashed #93d900" }} />
          <span className="text-gray-400">탐욕 (60-80)</span>
        </div>
      </div>
    </div>
  );
}
