/**
 * Alternative.me 히스토리 데이터를 Supabase에 적재하는 스크립트
 * 빈 날짜 자동 감지 및 채우기 기능 포함
 *
 * 실행 방법:
 * cd fng-dashboard && node scripts/seed-historical-data.mjs           # 빈 날짜만 채우기
 * cd fng-dashboard && node scripts/seed-historical-data.mjs --full    # 2020년 이후 전체 데이터
 * cd fng-dashboard && node scripts/seed-historical-data.mjs --days=30 # 최근 30일 데이터
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// .env.local 파일 읽기
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

try {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      process.env[key.trim()] = value;
    }
  });
  console.log("✅ .env.local 파일 로드 완료\n");
} catch {
  console.log("⚠️  .env.local 파일을 찾을 수 없습니다. 환경 변수를 직접 사용합니다.\n");
}

// NEXT_PUBLIC_ 접두사 버전도 지원
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Unix timestamp를 ISO 8601로 변환
 */
function unixToISO(timestamp) {
  return new Date(parseInt(timestamp, 10) * 1000).toISOString();
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
function toDateString(date) {
  return date.toISOString().split("T")[0];
}

// 2020년 1월 1일 (Unix timestamp)
const START_DATE_2020 = new Date("2020-01-01T00:00:00Z").getTime() / 1000;

/**
 * Supabase에서 저장된 날짜 목록 가져오기
 */
async function getExistingDates() {
  console.log("� Supabase에서 기존 데이터 날짜 조회 중...");

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/fng_logs?select=timestamp&order=timestamp.desc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase 조회 실패: ${response.status}`);
  }

  const data = await response.json();

  // 날짜만 추출하여 Set으로 변환 (중복 제거)
  const dateSet = new Set(data.map((item) => toDateString(new Date(item.timestamp))));

  console.log(`✅ 기존 ${dateSet.size}개의 날짜 데이터 확인`);
  return dateSet;
}

/**
 * 빈 날짜 찾기
 */
function findMissingDates(existingDates, startDate, endDate) {
  const missing = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = toDateString(current);
    if (!existingDates.has(dateStr)) {
      missing.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  return missing;
}

/**
 * Alternative.me API에서 데이터 가져오기
 */
async function fetchFngData(limit = 0) {
  console.log(`📡 Alternative.me API에서 데이터 가져오는 중... (limit=${limit || "all"})`);

  const url =
    limit > 0
      ? `https://api.alternative.me/fng/?limit=${limit}&format=json`
      : "https://api.alternative.me/fng/?limit=0&format=json";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ ${data.data.length}개의 데이터 포인트 수신`);

  return data.data.map((item) => ({
    value: parseInt(item.value, 10),
    value_classification: item.value_classification,
    timestamp: unixToISO(item.timestamp),
    dateStr: toDateString(new Date(parseInt(item.timestamp, 10) * 1000)),
  }));
}

/**
 * Alternative.me API에서 2020년 이후 데이터 가져오기
 */
async function fetchAllFngData() {
  const allData = await fetchFngData(0);

  // 2020년 이후 데이터만 필터링
  const filtered = allData.filter((item) => {
    const timestamp = new Date(item.timestamp).getTime() / 1000;
    return timestamp >= START_DATE_2020;
  });

  console.log(`✅ 2020년 이후 ${filtered.length}개의 데이터 포인트 필터링`);
  return filtered;
}

/**
 * Supabase에 데이터 Upsert (배치 처리)
 */
async function upsertToSupabase(records) {
  console.log("💾 Supabase에 데이터 적재 중...");

  // 배치 크기 (Supabase 제한 고려)
  const BATCH_SIZE = 500;
  let insertedCount = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/fng_logs`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates", // Upsert 활성화
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ 배치 ${i / BATCH_SIZE + 1} 실패:`, error);
      continue;
    }

    insertedCount += batch.length;
    console.log(`  📦 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}개 처리 완료`);
  }

  console.log(`✅ 총 ${insertedCount}개 레코드 적재 완료`);
}

/**
 * 메인 실행
 */
async function main() {
  const args = process.argv.slice(2);
  const isFullMode = args.includes("--full");
  const daysArg = args.find((arg) => arg.startsWith("--days="));
  const specificDays = daysArg ? parseInt(daysArg.split("=")[1], 10) : null;

  console.log("🚀 Fear & Greed Index 데이터 적재 시작\n");

  // 환경 변수 확인
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ 환경 변수가 설정되지 않았습니다.");
    console.error("");
    console.error("실행 예시:");
    console.error(
      'SUPABASE_URL="https://xxx.supabase.co" SUPABASE_ANON_KEY="xxx" node scripts/seed-historical-data.mjs'
    );
    process.exit(1);
  }

  try {
    if (isFullMode) {
      // --full: 2020년 이후 전체 데이터
      console.log("📦 모드: 2020년 이후 전체 데이터 적재\n");
      const records = await fetchAllFngData();
      await upsertToSupabase(records);

      console.log("\n🎉 전체 히스토리 데이터 적재 완료!");
      console.log(`   - 시작일: ${records[records.length - 1].timestamp}`);
      console.log(`   - 종료일: ${records[0].timestamp}`);
    } else if (specificDays) {
      // --days=N: 최근 N일 데이터
      console.log(`📦 모드: 최근 ${specificDays}일 데이터 적재\n`);
      const records = await fetchFngData(specificDays);
      await upsertToSupabase(records);

      console.log("\n🎉 데이터 적재 완료!");
      console.log(`   - ${records.length}개 레코드 처리`);
    } else {
      // 기본: 빈 날짜만 채우기
      console.log("📦 모드: 빈 날짜 자동 감지 및 채우기\n");

      // 1. 기존 데이터 날짜 조회
      const existingDates = await getExistingDates();

      // 2. 최근 30일 데이터 가져오기 (API에서)
      const apiData = await fetchFngData(30);

      // 3. 빈 날짜 찾기
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const missingDates = findMissingDates(existingDates, thirtyDaysAgo, today);

      if (missingDates.length === 0) {
        console.log("\n✅ 빈 날짜가 없습니다. 모든 데이터가 최신 상태입니다!");
        return;
      }

      console.log(`\n⚠️  ${missingDates.length}개의 빈 날짜 발견:`);
      missingDates.forEach((date) => console.log(`   - ${date}`));

      // 4. 빈 날짜에 해당하는 데이터만 필터링
      const recordsToInsert = apiData
        .filter((item) => missingDates.includes(item.dateStr))
        .map(({ dateStr, ...rest }) => rest); // dateStr 제거

      if (recordsToInsert.length === 0) {
        console.log("\n⚠️  API에서 빈 날짜에 해당하는 데이터를 찾을 수 없습니다.");
        return;
      }

      console.log(`\n📥 ${recordsToInsert.length}개의 누락된 데이터 적재 중...`);
      await upsertToSupabase(recordsToInsert);

      console.log("\n🎉 빈 날짜 데이터 적재 완료!");
      recordsToInsert.forEach((record) => {
        console.log(
          `   ✅ ${record.timestamp.split("T")[0]}: ${record.value} (${
            record.value_classification
          })`
        );
      });
    }
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  }
}

main();
