"use client";

import { useI18n } from "@/lib/i18n-context";
import { FngDataPoint } from "@/lib/api";

interface AiInsightProps {
  current: FngDataPoint;
}

export default function AiInsight({ current }: AiInsightProps) {
  const { t, fontClass } = useI18n();

  // 데이터가 없으면 렌더링하지 않음
  if (!current.ai_comment && !current.btc_price && !current.eth_price) {
    return null;
  }

  return (
    <div className="dark-box p-6 mb-8 border border-[#4a3828] bg-[#0d0a08] relative overflow-hidden group">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-linear-to-r from-[#8b0000]/5 to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className={`${fontClass} text-xl text-[#c03030] mb-4 flex items-center gap-2`}>
          <span>🤖</span> {t.aiInsight.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI 코멘트 */}
          <div className="md:col-span-2">
            <div className="bg-[#1a1512] p-4 border border-[#3d2d1f] h-full">
              <p className={`${fontClass} text-sm text-[#c4b59d] leading-relaxed whitespace-pre-wrap`}>
                {current.ai_comment || "The oracle is silent today..."}
              </p>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="space-y-4">
            {current.btc_price && (
              <div className="flex justify-between items-center p-3 bg-[#1a1512] border border-[#3d2d1f]">
                <span className={`${fontClass} text-[#a08060]`}>{t.aiInsight.btc}</span>
                <span className={`${fontClass} text-[#e0d0b8]`}>
                  ${current.btc_price.toLocaleString()}
                </span>
              </div>
            )}
            {current.eth_price && (
              <div className="flex justify-between items-center p-3 bg-[#1a1512] border border-[#3d2d1f]">
                <span className={`${fontClass} text-[#a08060]`}>{t.aiInsight.eth}</span>
                <span className={`${fontClass} text-[#e0d0b8]`}>
                  ${current.eth_price.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
