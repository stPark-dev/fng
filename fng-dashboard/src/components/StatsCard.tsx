'use client';

import { useState, useEffect } from 'react';
import { FngDataPoint, getIndexColor, getIndexLabelKo } from '@/lib/api';

const INVESTMENT_TIPS = [
  { quote: "공포에 사고, 환호에 팔아라", author: "워렌 버핏" },
  { quote: "다른 사람들이 탐욕스러울 때 두려워하고, 다른 사람들이 두려워할 때 탐욕스러워라", author: "워렌 버핏" },
  { quote: "시장은 단기적으로 투표 기계지만, 장기적으로는 저울이다", author: "벤저민 그레이엄" },
  { quote: "최고의 투자 시간은 피가 거리에 흥건할 때다", author: "로스차일드" },
  { quote: "복리는 세계 8번째 불가사의다", author: "알버트 아인슈타인" },
  { quote: "투자에서 가장 위험한 말은 '이번엔 다르다'이다", author: "존 템플턴" },
  { quote: "주식시장은 인내심 없는 사람의 돈을 인내심 있는 사람에게 옮기는 도구다", author: "워렌 버핏" },
  { quote: "10년 동안 보유할 주식이 아니라면 10분도 보유하지 마라", author: "워렌 버핏" },
  { quote: "분산투자는 무지에 대한 방어책이다", author: "워렌 버핏" },
  { quote: "시장을 이기려 하지 말고, 시장과 함께 가라", author: "존 보글" },
  { quote: "가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것이다", author: "워렌 버핏" },
  { quote: "투자의 첫 번째 규칙: 절대 돈을 잃지 마라. 두 번째 규칙: 첫 번째 규칙을 잊지 마라", author: "워렌 버핏" },
  { quote: "군중을 따르면 군중 이상이 될 수 없다", author: "앙드레 코스톨라니" },
  { quote: "주식을 사는 것은 사업의 일부를 사는 것이다", author: "벤저민 그레이엄" },
  { quote: "하락장은 기회다. 공포가 극대화될 때 최고의 매수 기회가 온다", author: "피터 린치" },
  { quote: "시장 타이밍을 맞추려 하지 말고, 시장에 머무는 시간을 늘려라", author: "켄 피셔" },
  { quote: "단기 변동에 흔들리지 마라. 장기적 관점을 유지하라", author: "존 보글" },
  { quote: "투자는 마라톤이지, 단거리 경주가 아니다", author: "피터 린치" },
  { quote: "최악의 시기에 팔고, 최고의 시기에 사지 마라", author: "하워드 막스" },
  { quote: "감정은 투자의 적이다. 냉철함을 유지하라", author: "벤저민 그레이엄" },
];

interface StatsCardProps {
  yearHigh: FngDataPoint;
  yearLow: FngDataPoint;
}

export default function StatsCard({ yearHigh, yearLow }: StatsCardProps) {
  const [tip, setTip] = useState(INVESTMENT_TIPS[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * INVESTMENT_TIPS.length);
    setTip(INVESTMENT_TIPS[randomIndex]);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6">
        1년 통계
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* 1년 최고 */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📈</span>
            <span className="text-gray-400 text-sm">1년 최고</span>
          </div>
          <div
            className="text-4xl font-bold"
            style={{ color: getIndexColor(yearHigh.value) }}
          >
            {yearHigh.value}
          </div>
          <div
            className="text-sm font-medium mt-1"
            style={{ color: getIndexColor(yearHigh.value) }}
          >
            {getIndexLabelKo(yearHigh.value)}
          </div>
          <div className="text-gray-500 text-xs mt-2">
            {formatDate(yearHigh.date)}
          </div>
        </div>

        {/* 1년 최저 */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📉</span>
            <span className="text-gray-400 text-sm">1년 최저</span>
          </div>
          <div
            className="text-4xl font-bold"
            style={{ color: getIndexColor(yearLow.value) }}
          >
            {yearLow.value}
          </div>
          <div
            className="text-sm font-medium mt-1"
            style={{ color: getIndexColor(yearLow.value) }}
          >
            {getIndexLabelKo(yearLow.value)}
          </div>
          <div className="text-gray-500 text-xs mt-2">
            {formatDate(yearLow.date)}
          </div>
        </div>
      </div>

      {/* 투자 팁 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-800/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-white font-semibold mb-1">투자 팁</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              &quot;{tip.quote}&quot;
              <br />
              <span className="text-gray-500">- {tip.author}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
