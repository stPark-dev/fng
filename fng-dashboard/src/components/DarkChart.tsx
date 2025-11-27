"use client";

import { useState, useEffect } from "react";
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
  AreaChart,
} from "recharts";
import { FngDataPoint, FngPeriod, fetchFngByPeriod } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

interface DarkChartProps {
  data30d: FngDataPoint[];
  data1y: FngDataPoint[];
  data2y: FngDataPoint[];
}

function getDarkColor(value: number): string {
  if (value <= 20) return "#ff4444";
  if (value <= 40) return "#ff8844";
  if (value <= 60) return "#ccaa66";
  if (value <= 80) return "#88bb44";
  return "#aa44ff";
}

export default function DarkChart({ data30d, data1y, data2y }: DarkChartProps) {
  const [period, setPeriod] = useState<FngPeriod>("30d");
  const [dynamicData, setDynamicData] = useState<FngDataPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { t, locale, fontClass } = useI18n();

  // 서버에서 전달받은 데이터
  const preloadedData: Record<string, FngDataPoint[]> = {
    "30d": data30d,
    "1y": data1y,
    "2y": data2y,
  };

  // 동적으로 로드해야 하는 기간들
  const needsDynamicLoad = ["7d", "2m", "3m"].includes(period);

  useEffect(() => {
    if (needsDynamicLoad) {
      setLoading(true);
      fetchFngByPeriod(period)
        .then(setDynamicData)
        .finally(() => setLoading(false));
    } else {
      setDynamicData(null);
    }
  }, [period, needsDynamicLoad]);

  const data = needsDynamicLoad ? dynamicData : preloadedData[period];

  // 데이터가 없거나 로딩 중일 때 처리
  if (!data || loading) {
    return (
      <div className="dark-box p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`${fontClass} text-base text-[#c03030]`}>
            {t.chart.cursedTimeline}
          </h2>
        </div>
        <div className="h-80 flex items-center justify-center">
          <p className={`${fontClass} text-sm text-[#907050]`}>
            {loading ? "Loading..." : "No data"}
          </p>
        </div>
      </div>
    );
  }

  // 기간에 따른 날짜 포맷
  const getDateFormat = (period: FngPeriod) => {
    if (["7d", "30d"].includes(period)) {
      return { month: "short" as const, day: "numeric" as const };
    }
    if (["2m", "3m"].includes(period)) {
      return { month: "short" as const, day: "numeric" as const };
    }
    return { year: "2-digit" as const, month: "short" as const };
  };

  const chartData = [...data].reverse().map((item, index) => ({
    index, // 고유 인덱스 추가
    date: item.date.toLocaleDateString(
      locale === "ko" ? "ko-KR" : "en-US",
      getDateFormat(period)
    ),
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
        <div className="dark-box p-4 blood-border">
          <p className={`${fontClass} text-sm text-[#a08060]`}>
            {data.fullDate}
          </p>
          <p
            className={`${fontClass} text-2xl mt-2 font-bold`}
            style={{ color, textShadow: `0 0 15px ${color}` }}
          >
            {data.value}
          </p>
          <p
            className={`${fontClass} text-sm mt-1`}
            style={{ color }}
          >
            {getDarkLabel(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const periodButtons: { key: FngPeriod; label: string }[] = [
    { key: "7d", label: t.chart.days7 },
    { key: "30d", label: t.chart.days30 },
    { key: "2m", label: t.chart.months2 },
    { key: "3m", label: t.chart.months3 },
    { key: "1y", label: t.chart.year1 },
    { key: "2y", label: t.chart.years2 },
  ];

  // 기간에 따른 X축 간격
  const getXAxisInterval = (period: FngPeriod) => {
    switch (period) {
      case "7d": return 0;
      case "30d": return 4;
      case "2m": return 7;
      case "3m": return 10;
      case "1y": return 30;
      case "2y": return 60;
      default: return "preserveStartEnd";
    }
  };

  return (
    <div className="dark-box p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className={`${fontClass} text-base text-[#c03030]`}>
          {t.chart.cursedTimeline}
        </h2>

        <div className="flex flex-wrap gap-2">
          {periodButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`${fontClass} text-sm px-4 py-2 border-2 transition-all ${
                period === key
                  ? "border-[#c03030] bg-[#c03030] text-[#fff0f0] shadow-[0_0_15px_#c0303080]"
                  : "border-[#4a3828] text-[#a08060] hover:border-[#c03030] hover:text-[#c03030]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c03030" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#c03030" stopOpacity={0.05}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#3a2a1a" />

            <XAxis
              dataKey="index"
              stroke="#4a3828"
              tick={{ fill: "#a08060", fontSize: 12, fontFamily: "monospace" }}
              tickLine={{ stroke: "#4a3828" }}
              interval={getXAxisInterval(period)}
              tickFormatter={(index) => chartData[index]?.date || ""}
            />

            <YAxis
              domain={[0, 100]}
              stroke="#4a3828"
              tick={{ fill: "#a08060", fontSize: 12, fontFamily: "monospace" }}
              tickLine={{ stroke: "#4a3828" }}
              ticks={[0, 20, 40, 60, 80, 100]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#c03030", strokeWidth: 1, strokeDasharray: "5 5" }}
            />

            {/* 구간 참조선 */}
            <ReferenceLine y={20} stroke="#ff4444" strokeDasharray="5 5" strokeOpacity={0.5} />
            <ReferenceLine y={50} stroke="#ccaa66" strokeDasharray="5 5" strokeOpacity={0.4} />
            <ReferenceLine y={80} stroke="#aa44ff" strokeDasharray="5 5" strokeOpacity={0.5} />

            {/* 영역 채우기 */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#c03030"
              strokeWidth={period === "1y" || period === "2y" ? 1.5 : 3}
              fill="url(#colorValue)"
              dot={false}
              activeDot={{
                r: 6,
                fill: "#c03030",
                stroke: "#fff0f0",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
              style={{
                filter: "drop-shadow(0 0 8px #c03030)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        {[
          { label: t.chart.terrorZone, color: "#ff4444", value: "0-20" },
          { label: t.chart.neutralVoid, color: "#ccaa66", value: "40-60" },
          { label: t.chart.madnessRealm, color: "#aa44ff", value: "80-100" },
        ].map(({ label, color, value }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-4 h-4"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            />
            <span className={`${fontClass} text-sm text-[#a08060]`}>
              {label} ({value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
