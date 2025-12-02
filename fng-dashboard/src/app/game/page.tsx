"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { CandleChart } from "@/components/CandleChart";
import { fetchGameCandles, CandleData, CandleInterval, INTERVAL_LABELS } from "@/lib/binance-api";

type Position = "long" | "short";
type GamePhase = "setup" | "playing" | "waiting" | "revealing" | "result" | "finished";

interface RoundResult {
  round: number;
  position: Position;
  entryPrice: number;
  exitPrice: number;
  priceChange: number;
  isCorrect: boolean;
}

const ROUNDS_OPTIONS = [5, 10, 25];
const VISIBLE_CANDLES = 150; // 사용자에게 보여줄 캔들 수
const FUTURE_CANDLES = 5; // 결과 확인용 미래 캔들 수
const REVEAL_DELAY = 800; // 각 캔들 공개 딜레이 (ms)

export default function GamePage() {
  // 게임 설정
  const [interval, setInterval] = useState<CandleInterval>("15m");
  const [totalRounds, setTotalRounds] = useState(10);

  // 게임 상태
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);

  // 차트 데이터
  const [visibleData, setVisibleData] = useState<CandleData[]>([]);
  const [futureData, setFutureData] = useState<CandleData[]>([]);
  const [revealedCount, setRevealedCount] = useState(0); // 공개된 미래 캔들 수
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 현재 라운드 포지션
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // 타이머 ref
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 새 라운드 데이터 로드
  const loadNewRound = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRevealedCount(0);
    setSelectedPosition(null);

    try {
      const { visibleData: visible, futureData: future } = await fetchGameCandles(
        interval,
        VISIBLE_CANDLES,
        FUTURE_CANDLES
      );
      setVisibleData(visible);
      setFutureData(future);
      setPhase("playing");
    } catch (err) {
      console.error("Failed to load candle data:", err);
      setError("데이터를 불러오는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [interval]);

  // 게임 시작
  const startGame = useCallback(() => {
    setCurrentRound(1);
    setScore(0);
    setResults([]);
    loadNewRound();
  }, [loadNewRound]);

  // 캔들 순차 공개
  const revealCandles = useCallback(
    (position: Position) => {
      let count = 0;
      setPhase("revealing");

      const revealNext = () => {
        count++;
        setRevealedCount(count);

        if (count < FUTURE_CANDLES) {
          revealTimerRef.current = setTimeout(revealNext, REVEAL_DELAY);
        } else {
          // 모든 캔들 공개 완료 - 결과 계산
          setTimeout(() => {
            const entryPrice = visibleData[visibleData.length - 1]?.close || 0;
            const exitPrice = futureData[futureData.length - 1]?.close || 0;
            const priceChange = ((exitPrice - entryPrice) / entryPrice) * 100;

            const isCorrect = position === "long" ? priceChange > 0 : priceChange < 0;

            const roundResult: RoundResult = {
              round: currentRound,
              position,
              entryPrice,
              exitPrice,
              priceChange,
              isCorrect,
            };

            setResults((prev) => [...prev, roundResult]);
            if (isCorrect) {
              setScore((prev) => prev + 1);
            }
            setPhase("result");
          }, 500);
        }
      };

      // 첫 캔들 공개 시작
      revealTimerRef.current = setTimeout(revealNext, REVEAL_DELAY);
    },
    [visibleData, futureData, currentRound]
  );

  // 포지션 선택 (Long/Short)
  const selectPosition = useCallback(
    (position: Position) => {
      if (phase !== "playing" || selectedPosition) return;

      setSelectedPosition(position);
      setPhase("waiting");

      // 잠시 대기 후 캔들 공개 시작
      setTimeout(() => {
        revealCandles(position);
      }, 800);
    },
    [phase, selectedPosition, revealCandles]
  );

  // 다음 라운드 또는 게임 종료
  const nextRound = useCallback(() => {
    if (currentRound >= totalRounds) {
      setPhase("finished");
    } else {
      setCurrentRound((prev) => prev + 1);
      loadNewRound();
    }
  }, [currentRound, totalRounds, loadNewRound]);

  // 게임 재시작
  const restartGame = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
    }
    setPhase("setup");
    setCurrentRound(0);
    setScore(0);
    setResults([]);
    setVisibleData([]);
    setFutureData([]);
    setRevealedCount(0);
    setSelectedPosition(null);
  }, []);

  // 현재까지 공개된 미래 캔들
  const revealedFutureData = futureData.slice(0, revealedCount);

  // 승률 계산
  const winRate = results.length > 0 ? (score / results.length) * 100 : 0;

  // 결과 요약
  const totalPnL = results.reduce((sum, r) => {
    const pnl = r.isCorrect ? Math.abs(r.priceChange) : -Math.abs(r.priceChange);
    return sum + pnl;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0d0a08] text-[#a08060] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <Link
            href="/dashboard"
            className="inline-block mb-4 text-sm text-[#806040] hover:text-[#c03030] transition-colors"
          >
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#c09050] mb-2">🎯 롱/숏 예측 게임</h1>
          <p className="text-[#806040]">과거 BTC 캔들 차트를 보고 다음 움직임을 예측하세요!</p>
        </header>

        {/* 설정 화면 */}
        {phase === "setup" && (
          <div className="bg-[#1a1512] rounded-2xl p-6 md:p-8 border border-[#3d2d1f]">
            <h2 className="text-xl font-bold text-[#c09050] mb-6 text-center">⚙️ 게임 설정</h2>

            {/* 캔들 간격 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">📊 캔들 간격</label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(INTERVAL_LABELS) as CandleInterval[]).map((iv) => (
                  <button
                    key={iv}
                    onClick={() => setInterval(iv)}
                    className={`py-2 px-3 rounded-lg font-medium transition-all ${
                      interval === iv
                        ? "bg-[#c03030] text-white"
                        : "bg-[#2a2118] hover:bg-[#3a3128] text-[#a08060]"
                    }`}
                  >
                    {INTERVAL_LABELS[iv]}
                  </button>
                ))}
              </div>
            </div>

            {/* 라운드 수 선택 */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">🔄 라운드 수</label>
              <div className="grid grid-cols-3 gap-2">
                {ROUNDS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setTotalRounds(r)}
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${
                      totalRounds === r
                        ? "bg-[#c03030] text-white"
                        : "bg-[#2a2118] hover:bg-[#3a3128] text-[#a08060]"
                    }`}
                  >
                    {r} 라운드
                  </button>
                ))}
              </div>
            </div>

            {/* 시작 버튼 */}
            <button
              onClick={startGame}
              className="w-full py-4 bg-linear-to-r from-[#c03030] to-[#d04040] text-white text-lg font-bold rounded-xl hover:from-[#d04040] hover:to-[#e05050] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              🚀 게임 시작
            </button>
          </div>
        )}

        {/* 게임 화면 */}
        {(phase === "playing" ||
          phase === "waiting" ||
          phase === "revealing" ||
          phase === "result") && (
          <div className="space-y-4">
            {/* 상태 바 */}
            <div className="bg-[#1a1512] rounded-xl p-4 border border-[#3d2d1f] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm">📊 {INTERVAL_LABELS[interval]}</span>
                <span className="text-sm">
                  🎯 {currentRound} / {totalRounds}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">✅ {score} 승</span>
                <span className="text-sm">📈 {winRate.toFixed(0)}%</span>
              </div>
            </div>

            {/* 로딩 */}
            {loading && (
              <div className="bg-[#1a1512] rounded-2xl p-8 border border-[#3d2d1f] flex flex-col items-center justify-center h-[400px]">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p>차트 데이터 로딩 중...</p>
              </div>
            )}

            {/* 에러 */}
            {error && (
              <div className="bg-[#1a1512] rounded-2xl p-8 border border-red-500/30 flex flex-col items-center justify-center h-[400px]">
                <div className="text-4xl mb-4">❌</div>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadNewRound}
                  className="px-6 py-2 bg-[#c03030] text-white rounded-lg hover:bg-[#d04040]"
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* 차트 */}
            {!loading && !error && visibleData.length > 0 && (
              <div className="bg-[#1a1512] rounded-2xl p-4 border border-[#3d2d1f]">
                <CandleChart
                  data={visibleData}
                  futureData={revealedFutureData}
                  showFuture={revealedCount > 0}
                  entryPrice={visibleData[visibleData.length - 1]?.close}
                  height={350}
                />
              </div>
            )}

            {/* 대기 중 표시 */}
            {phase === "waiting" && (
              <div className="bg-[#1a1512] rounded-xl p-6 border border-[#3d2d1f] text-center">
                <div className="text-4xl mb-2 animate-pulse">
                  {selectedPosition === "long" ? "📈" : "📉"}
                </div>
                <p className="text-lg">
                  {selectedPosition === "long" ? "LONG" : "SHORT"} 선택 완료!
                </p>
              </div>
            )}

            {/* 캔들 공개 중 표시 */}
            {phase === "revealing" && (
              <div className="bg-[#1a1512] rounded-xl p-6 border border-[#3d2d1f] text-center">
                <div className="text-4xl mb-2">{selectedPosition === "long" ? "📈" : "📉"}</div>
                <p className="text-lg mb-3">
                  캔들 공개 중... ({revealedCount}/{FUTURE_CANDLES})
                </p>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: FUTURE_CANDLES }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-8 rounded transition-all duration-300 ${
                        i < revealedCount
                          ? futureData[i]?.close >= futureData[i]?.open
                            ? "bg-green-500"
                            : "bg-red-500"
                          : "bg-[#3d2d1f]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 결과 표시 */}
            {phase === "result" && results.length > 0 && (
              <div
                className={`rounded-xl p-6 border text-center ${
                  results[results.length - 1].isCorrect
                    ? "bg-green-900/30 border-green-500/50"
                    : "bg-red-900/30 border-red-500/50"
                }`}
              >
                <div className="text-4xl mb-2">
                  {results[results.length - 1].isCorrect ? "🎉" : "😢"}
                </div>
                <p className="text-2xl font-bold mb-2">
                  {results[results.length - 1].isCorrect ? "정답!" : "오답!"}
                </p>
                <p className="text-sm opacity-80 mb-4">
                  가격 변화:{" "}
                  <span
                    className={
                      results[results.length - 1].priceChange >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {results[results.length - 1].priceChange >= 0 ? "+" : ""}
                    {results[results.length - 1].priceChange.toFixed(3)}%
                  </span>
                </p>
                <button
                  onClick={nextRound}
                  className="px-8 py-3 bg-[#c03030] text-white font-bold rounded-lg hover:bg-[#d04040] transition-all"
                >
                  {currentRound >= totalRounds ? "결과 보기" : "다음 라운드"} →
                </button>
              </div>
            )}

            {/* Long/Short 버튼 */}
            {phase === "playing" && !loading && !error && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => selectPosition("short")}
                  disabled={!!selectedPosition}
                  className="py-6 bg-linear-to-r from-red-600 to-red-500 text-white text-xl font-bold rounded-xl hover:from-red-500 hover:to-red-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📉 SHORT
                  <span className="block text-sm font-normal opacity-80 mt-1">하락에 배팅</span>
                </button>
                <button
                  onClick={() => selectPosition("long")}
                  disabled={!!selectedPosition}
                  className="py-6 bg-linear-to-r from-green-600 to-green-500 text-white text-xl font-bold rounded-xl hover:from-green-500 hover:to-green-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📈 LONG
                  <span className="block text-sm font-normal opacity-80 mt-1">상승에 배팅</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 최종 결과 화면 */}
        {phase === "finished" && (
          <div className="bg-[#1a1512] rounded-2xl p-6 md:p-8 border border-[#3d2d1f]">
            <h2 className="text-2xl font-bold text-[#c09050] mb-6 text-center">🏆 게임 결과</h2>

            {/* 점수 요약 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#2a2118] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[#c09050]">
                  {score}/{totalRounds}
                </p>
                <p className="text-sm text-[#806040]">점수</p>
              </div>
              <div className="bg-[#2a2118] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[#c09050]">{winRate.toFixed(0)}%</p>
                <p className="text-sm text-[#806040]">승률</p>
              </div>
              <div className="bg-[#2a2118] rounded-xl p-4 text-center">
                <p
                  className={`text-3xl font-bold ${
                    totalPnL >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {totalPnL >= 0 ? "+" : ""}
                  {totalPnL.toFixed(2)}%
                </p>
                <p className="text-sm text-[#806040]">손익</p>
              </div>
            </div>

            {/* 평가 메시지 */}
            <div className="text-center mb-6 p-4 bg-[#2a2118] rounded-xl">
              {winRate >= 70 && (
                <p className="text-lg">🌟 훌륭합니다! 뛰어난 트레이딩 감각을 가지고 계시네요!</p>
              )}
              {winRate >= 50 && winRate < 70 && (
                <p className="text-lg">👍 좋습니다! 절반 이상 맞추셨어요!</p>
              )}
              {winRate < 50 && (
                <p className="text-lg">💪 연습하면 더 좋아질 거예요! 다시 도전해보세요!</p>
              )}
            </div>

            {/* 라운드별 결과 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#806040] mb-3">📋 라운드별 결과</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {results.map((r) => (
                  <div
                    key={r.round}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      r.isCorrect ? "bg-green-900/20" : "bg-red-900/20"
                    }`}
                  >
                    <span className="text-sm">
                      {r.round}. {r.position.toUpperCase()}
                    </span>
                    <span
                      className={`text-sm ${
                        r.priceChange >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {r.priceChange >= 0 ? "+" : ""}
                      {r.priceChange.toFixed(3)}%
                    </span>
                    <span>{r.isCorrect ? "✅" : "❌"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 버튼 */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={restartGame}
                className="py-3 bg-[#2a2118] text-[#a08060] font-medium rounded-lg hover:bg-[#3a3128] transition-all"
              >
                ⚙️ 새 게임
              </button>
              <button
                onClick={startGame}
                className="py-3 bg-[#c03030] text-white font-medium rounded-lg hover:bg-[#d04040] transition-all"
              >
                🔄 다시 하기
              </button>
            </div>
          </div>
        )}

        {/* 푸터 - 설명 */}
        {phase === "setup" && (
          <div className="mt-8 text-center text-sm text-[#604030] space-y-2">
            <p>💡 과거 BTC 가격 데이터를 랜덤하게 선택하여 보여줍니다.</p>
            <p>📈 90개의 캔들을 보고 다음 5개 캔들의 방향을 예측하세요.</p>
            <p>🎮 실제 투자가 아닌 연습용 게임입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
