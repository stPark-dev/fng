/**
 * Fear & Greed Index API 유틸리티
 * - Supabase에서 데이터 조회
 */

export interface FngDataPoint {
  value: number;
  value_classification: string;
  timestamp: string;
  date: Date;
  btc_price?: number;
  eth_price?: number;
  ai_comment?: string;
}

export interface FngStats {
  current: FngDataPoint;
  yesterday: FngDataPoint;
  change: number;
  yearHigh: FngDataPoint;
  yearLow: FngDataPoint;
}

// Supabase 설정
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase REST API 호출
 */
async function supabaseQuery<T>(
  table: string,
  query: string = "",
  options: RequestInit = {}
): Promise<T> {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    next: { revalidate: 3600 }, // 1시간 캐시
  });

  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Supabase 응답을 FngDataPoint로 변환
 */
interface SupabaseRecord {
  value: number;
  value_classification: string;
  timestamp: string;
  btc_price?: number;
  eth_price?: number;
  ai_comment?: string;
}

const transformRecord = (record: SupabaseRecord): FngDataPoint => ({
  value: record.value,
  value_classification: record.value_classification,
  timestamp: record.timestamp,
  date: new Date(record.timestamp),
  btc_price: record.btc_price,
  eth_price: record.eth_price,
  ai_comment: record.ai_comment,
});

/**
 * Fear & Greed Index 데이터 가져오기 (Supabase)
 */
export async function fetchFngData(limit: number = 30): Promise<FngDataPoint[]> {
  const query =
    limit > 0
      ? `select=value,value_classification,timestamp,btc_price,eth_price,ai_comment&order=timestamp.desc&limit=${limit}`
      : `select=value,value_classification,timestamp,btc_price,eth_price,ai_comment&order=timestamp.desc`;

  const data = await supabaseQuery<SupabaseRecord[]>("fng_logs", query);

  return data.map(transformRecord);
}

export type FngPeriod = "7d" | "30d" | "2m" | "3m" | "1y" | "2y";

/**
 * 기간별 데이터 가져오기
 */
export async function fetchFngByPeriod(period: FngPeriod): Promise<FngDataPoint[]> {
  const now = new Date();
  let fromDate: Date | null = null;

  switch (period) {
    case "7d":
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "2m":
      fromDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      break;
    case "3m":
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "1y":
      fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case "2y":
      fromDate = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      break;
  }

  let query = "select=value,value_classification,timestamp,btc_price,eth_price,ai_comment&order=timestamp.desc";

  if (fromDate) {
    query += `&timestamp=gte.${fromDate.toISOString()}`;
  }

  const data = await supabaseQuery<SupabaseRecord[]>("fng_logs", query);

  return data.map(transformRecord);
}

/**
 * 통계 데이터 계산
 */
export async function fetchFngStats(): Promise<FngStats> {
  // 1년치 데이터 가져오기
  const yearData = await fetchFngByPeriod("1y");

  if (yearData.length < 2) {
    throw new Error("Not enough data points");
  }

  const current = yearData[0];
  const yesterday = yearData[1];
  const change = current.value - yesterday.value;

  // 1년 중 최고/최저 찾기
  const yearHigh = yearData.reduce((max, item) => (item.value > max.value ? item : max));
  const yearLow = yearData.reduce((min, item) => (item.value < min.value ? item : min));

  return {
    current,
    yesterday,
    change,
    yearHigh,
    yearLow,
  };
}

/**
 * 지수에 따른 색상 반환
 */
export function getIndexColor(value: number): string {
  if (value <= 20) return "#ea3943"; // Extreme Fear - 빨강
  if (value <= 40) return "#ea8c00"; // Fear - 주황
  if (value <= 60) return "#f5d100"; // Neutral - 노랑
  if (value <= 80) return "#93d900"; // Greed - 연두
  return "#16c784"; // Extreme Greed - 초록
}

/**
 * 지수에 따른 라벨 반환
 */
export function getIndexLabel(value: number): string {
  if (value <= 20) return "Extreme Fear";
  if (value <= 40) return "Fear";
  if (value <= 60) return "Neutral";
  if (value <= 80) return "Greed";
  return "Extreme Greed";
}

/**
 * 지수에 따른 한글 라벨 반환
 */
export function getIndexLabelKo(value: number): string {
  if (value <= 20) return "극단적 공포";
  if (value <= 40) return "공포";
  if (value <= 60) return "중립";
  if (value <= 80) return "탐욕";
  return "극단적 탐욕";
}
