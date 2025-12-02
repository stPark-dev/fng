/**
 * Binance API - 과거 BTCUSDT 캔들 데이터 가져오기
 */

export type CandleInterval = "1m" | "5m" | "15m" | "30m" | "1h";

export interface CandleData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 인터벌별 밀리초
const INTERVAL_MS: Record<CandleInterval, number> = {
  "1m": 60 * 1000,
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
};

/**
 * Binance에서 과거 캔들 데이터 가져오기
 * @param interval 캔들 간격
 * @param limit 가져올 캔들 수
 * @param endTime 종료 시간 (밀리초), 기본값은 랜덤 과거 시점
 */
export async function fetchHistoricalCandles(
  interval: CandleInterval,
  limit: number = 50,
  endTime?: number
): Promise<CandleData[]> {
  // 랜덤 과거 시점 선택 (최근 1년 내)
  if (!endTime) {
    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000; // 최근 1주일은 제외 (정답 유추 방지)
    endTime = Math.floor(Math.random() * (oneWeekAgo - oneYearAgo)) + oneYearAgo;
  }

  const url = new URL("https://api.binance.com/api/v3/klines");
  url.searchParams.set("symbol", "BTCUSDT");
  url.searchParams.set("interval", interval);
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("endTime", endTime.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`);
  }

  const data = await response.json();

  // Binance 응답 형식: [openTime, open, high, low, close, volume, closeTime, ...]
  return data.map((candle: (string | number)[]) => ({
    time: Math.floor(Number(candle[0]) / 1000), // 밀리초 -> 초
    open: parseFloat(candle[1] as string),
    high: parseFloat(candle[2] as string),
    low: parseFloat(candle[3] as string),
    close: parseFloat(candle[4] as string),
    volume: parseFloat(candle[5] as string),
  }));
}

/**
 * 게임용 캔들 데이터 가져오기
 * @param interval 캔들 간격
 * @param visibleCandles 화면에 보여줄 캔들 수
 * @param futureCandles 예측할 미래 캔들 수 (정답 확인용)
 */
export async function fetchGameCandles(
  interval: CandleInterval,
  visibleCandles: number = 30,
  futureCandles: number = 5
): Promise<{
  visibleData: CandleData[];
  futureData: CandleData[];
  entryPrice: number;
  exitPrice: number;
  result: "long" | "short" | "neutral";
}> {
  const totalCandles = visibleCandles + futureCandles;
  const candles = await fetchHistoricalCandles(interval, totalCandles);

  const visibleData = candles.slice(0, visibleCandles);
  const futureData = candles.slice(visibleCandles);

  // 진입가: 마지막 보이는 캔들의 종가
  const entryPrice = visibleData[visibleData.length - 1].close;
  // 청산가: 5틱 후 캔들의 종가
  const exitPrice = futureData[futureData.length - 1].close;

  // 결과 판정
  let result: "long" | "short" | "neutral";
  const priceDiff = exitPrice - entryPrice;
  const threshold = entryPrice * 0.0001; // 0.01% 이내면 중립

  if (priceDiff > threshold) {
    result = "long"; // 가격 상승 = 롱이 정답
  } else if (priceDiff < -threshold) {
    result = "short"; // 가격 하락 = 숏이 정답
  } else {
    result = "neutral";
  }

  return {
    visibleData,
    futureData,
    entryPrice,
    exitPrice,
    result,
  };
}

/**
 * 가격 변동률 계산
 */
export function calculatePriceChange(
  entry: number,
  exit: number
): {
  change: number;
  percentage: string;
  isProfit: boolean;
} {
  const change = exit - entry;
  const percentage = ((change / entry) * 100).toFixed(2);
  return {
    change,
    percentage: change >= 0 ? `+${percentage}%` : `${percentage}%`,
    isProfit: change > 0,
  };
}

/**
 * 인터벌 라벨
 */
export const INTERVAL_LABELS: Record<CandleInterval, string> = {
  "1m": "1분",
  "5m": "5분",
  "15m": "15분",
  "30m": "30분",
  "1h": "1시간",
};

/**
 * 인터벌별 ms 가져오기
 */
export function getIntervalMs(interval: CandleInterval): number {
  return INTERVAL_MS[interval];
}
