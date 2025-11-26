'use client';

import { useEffect, useState } from 'react';
import { getIndexColor, getIndexLabelKo } from '@/lib/api';

interface FearGreedGaugeProps {
  value: number;
  classification: string;
  change?: number;
}

export default function FearGreedGauge({ value, classification, change }: FearGreedGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(value);

  useEffect(() => {
    setAnimatedValue(value);
  }, [value]);

  // 반원형 게이지 각도 계산 (0-100 → 0-180도)
  // 0 = 왼쪽 끝 (빨강/공포), 100 = 오른쪽 끝 (초록/탐욕)
  const angle = (value / 100) * 180;
  const color = getIndexColor(value);

  // SVG 경로 계산
  const radius = 120;
  const centerX = 150;
  const centerY = 140;

  // 게이지 배경 arc
  const createArc = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle - 180) * (Math.PI / 180);
    const endRad = (endAngle - 180) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // 바늘 위치 계산 (0=왼쪽(-90도), 100=오른쪽(90도))
  // angle: 0→0도, 50→90도, 100→180도
  // 실제 각도: -90도(왼쪽) ~ 90도(오른쪽)
  const needleAngleDeg = angle - 90; // 0→-90도, 50→0도, 100→90도
  const needleAngleRad = needleAngleDeg * (Math.PI / 180);
  const needleLength = radius - 20;
  const needleX = centerX + needleLength * Math.cos(needleAngleRad);
  const needleY = centerY + needleLength * Math.sin(needleAngleRad);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        오늘의 공포 & 탐욕 지수
      </h2>

      <div className="relative">
        <svg viewBox="0 0 300 180" className="w-full max-w-md mx-auto">
          {/* 배경 그라데이션 호 - 왼쪽(0)=빨강(공포), 오른쪽(100)=초록(탐욕) */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ea3943" />
              <stop offset="20%" stopColor="#ea8c00" />
              <stop offset="40%" stopColor="#f5d100" />
              <stop offset="60%" stopColor="#f5d100" />
              <stop offset="80%" stopColor="#93d900" />
              <stop offset="100%" stopColor="#16c784" />
            </linearGradient>
          </defs>

          {/* 배경 호 */}
          <path
            d={createArc(0, 180)}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* 눈금 표시 */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = ((tick / 100) * 180 - 90) * (Math.PI / 180);
            const innerRadius = radius - 35;
            const outerRadius = radius + 15;
            const x1 = centerX + innerRadius * Math.cos(tickAngle);
            const y1 = centerY + innerRadius * Math.sin(tickAngle);
            const x2 = centerX + outerRadius * Math.cos(tickAngle);
            const y2 = centerY + outerRadius * Math.sin(tickAngle);

            const labelRadius = radius + 30;
            const labelX = centerX + labelRadius * Math.cos(tickAngle);
            const labelY = centerY + labelRadius * Math.sin(tickAngle);

            return (
              <g key={tick}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#4a5568"
                  strokeWidth="2"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-400 text-xs"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* 바늘 */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              transition: 'all 1s ease-out',
            }}
          />

          {/* 중심점 */}
          <circle cx={centerX} cy={centerY} r="12" fill={color} />
          <circle cx={centerX} cy={centerY} r="6" fill="#1a202c" />
        </svg>

        {/* 값 표시 */}
        <div className="text-center -mt-4">
          <div
            className="text-6xl font-bold"
            style={{ color }}
          >
            {animatedValue}
          </div>
          <div
            className="text-2xl font-semibold mt-2"
            style={{ color }}
          >
            {getIndexLabelKo(value)}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            {classification}
          </div>

          {/* 변동폭 표시 */}
          {change !== undefined && (
            <div className={`mt-3 text-lg font-medium ${change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
              {change > 0 ? '📈' : change < 0 ? '📉' : '➡️'}
              {' '}
              전일 대비 {change > 0 ? '+' : ''}{change}
            </div>
          )}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex justify-between mt-6 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#ea3943]" />
          <span>극단적 공포</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#ea8c00]" />
          <span>공포</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#f5d100]" />
          <span>중립</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#93d900]" />
          <span>탐욕</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#16c784]" />
          <span>극단적 탐욕</span>
        </div>
      </div>
    </div>
  );
}
