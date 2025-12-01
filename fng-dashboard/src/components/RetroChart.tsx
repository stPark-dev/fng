"use client";

import { useState, useMemo } from "react";
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
import { FngDataPoint, getIndexColor } from "@/lib/api";

interface RetroChartProps {
  data30d: FngDataPoint[];
  data1y: FngDataPoint[];
  data2y: FngDataPoint[];
}

type Period = "30d" | "1y" | "2y";

interface ChartDataPoint {
  date: string;
  fullDate: string;
  value: number;
  classification: string;
}

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    const color = getIndexColor(data.value);

    return (
      <div className="retro-box p-3">
        <p className="font-(family-name:--font-retro) text-[8px] text-gray-400">{data.fullDate}</p>
        <p className="font-(family-name:--font-retro) text-xl" style={{ color }}>
          {data.value}
        </p>
        <p className="font-(family-name:--font-retro) text-[8px]" style={{ color }}>
          {data.classification}
        </p>
      </div>
    );
  }
  return null;
}

export default function RetroChart({ data30d, data1y, data2y }: RetroChartProps) {
  const [period, setPeriod] = useState<Period>("30d");

  const periodData = useMemo(
    () => ({
      "30d": data30d,
      "1y": data1y,
      "2y": data2y,
    }),
    [data30d, data1y, data2y]
  );

  const data = periodData[period];

  const chartData = useMemo(
    () =>
      [...data].reverse().map((item) => ({
        date:
          period === "30d"
            ? item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : item.date.toLocaleDateString("en-US", { year: "2-digit", month: "short" }),
        fullDate: item.date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        value: item.value,
        classification: item.value_classification,
      })),
    [data, period]
  );

  return (
    <div className="retro-box p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-(family-name:--font-retro) text-[10px] text-[#00ffff]">HISTORY</h2>

        <div className="flex gap-2">
          {[
            { key: "30d", label: "30D" },
            { key: "1y", label: "1Y" },
            { key: "2y", label: "2Y" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key as Period)}
              className={`font-(family-name:--font-retro) text-[10px] px-3 py-1 border-2 transition-all ${
                period === key
                  ? "border-[#00ff00] bg-[#00ff00] text-black shadow-[0_0_10px_#00ff00]"
                  : "border-gray-600 text-gray-400 hover:border-[#00ff00] hover:text-[#00ff00]"
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
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />

            <XAxis
              dataKey="date"
              stroke="#333"
              tick={{ fill: "#666", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#333" }}
              interval={period === "30d" ? 4 : period === "1y" ? 30 : 60}
            />

            <YAxis
              domain={[0, 100]}
              stroke="#333"
              tick={{ fill: "#666", fontSize: 10, fontFamily: "monospace" }}
              tickLine={{ stroke: "#333" }}
              ticks={[0, 25, 50, 75, 100]}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 구간 참조선 */}
            <ReferenceLine y={20} stroke="#ea3943" strokeDasharray="5 5" strokeOpacity={0.3} />
            <ReferenceLine y={50} stroke="#f5d100" strokeDasharray="5 5" strokeOpacity={0.3} />
            <ReferenceLine y={80} stroke="#16c784" strokeDasharray="5 5" strokeOpacity={0.3} />

            {/* 메인 라인 */}
            <Line
              type="stepAfter"
              dataKey="value"
              stroke="#00ff00"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 6,
                fill: "#00ff00",
                stroke: "#000",
                strokeWidth: 2,
              }}
              style={{
                filter: "drop-shadow(0 0 8px #00ff00)",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-8 mt-4">
        {[
          { label: "EXTREME FEAR", color: "#ea3943", value: "0-20" },
          { label: "NEUTRAL", color: "#f5d100", value: "40-60" },
          { label: "EXTREME GREED", color: "#16c784", value: "80-100" },
        ].map(({ label, color, value }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3"
              style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}
            />
            <span className="font-(family-name:--font-retro) text-[8px] text-gray-500">
              {label} ({value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
