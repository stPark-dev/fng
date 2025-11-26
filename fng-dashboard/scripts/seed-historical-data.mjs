/**
 * Alternative.me 전체 히스토리 데이터를 Supabase에 적재하는 스크립트
 *
 * 실행 방법:
 * cd fng-dashboard && node scripts/seed-historical-data.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// .env.local 파일 읽기
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
  console.log('✅ .env.local 파일 로드 완료\n');
} catch {
  console.log('⚠️  .env.local 파일을 찾을 수 없습니다. 환경 변수를 직접 사용합니다.\n');
}

// NEXT_PUBLIC_ 접두사 버전도 지원
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Unix timestamp를 ISO 8601로 변환
 */
function unixToISO(timestamp) {
  return new Date(parseInt(timestamp, 10) * 1000).toISOString();
}

// 2020년 1월 1일 (Unix timestamp)
const START_DATE_2020 = new Date('2020-01-01T00:00:00Z').getTime() / 1000;

/**
 * Alternative.me API에서 2020년 이후 데이터 가져오기
 */
async function fetchAllFngData() {
  console.log('📡 Alternative.me API에서 2020년 이후 데이터 가져오는 중...');

  // limit=0은 전체 데이터 반환
  const response = await fetch('https://api.alternative.me/fng/?limit=0&format=json');

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status}`);
  }

  const data = await response.json();

  console.log(`✅ 전체 ${data.data.length}개의 데이터 포인트 수신`);

  // 2020년 이후 데이터만 필터링
  const filtered = data.data.filter(item => {
    const timestamp = parseInt(item.timestamp, 10);
    return timestamp >= START_DATE_2020;
  });

  console.log(`✅ 2020년 이후 ${filtered.length}개의 데이터 포인트 필터링`);

  return filtered.map(item => ({
    value: parseInt(item.value, 10),
    value_classification: item.value_classification,
    timestamp: unixToISO(item.timestamp),
  }));
}

/**
 * Supabase에 데이터 Upsert (배치 처리)
 */
async function upsertToSupabase(records) {
  console.log('💾 Supabase에 데이터 적재 중...');

  // 배치 크기 (Supabase 제한 고려)
  const BATCH_SIZE = 500;
  let insertedCount = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/fng_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates', // Upsert 활성화
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
  console.log('🚀 Fear & Greed Index 히스토리 데이터 적재 시작\n');

  // 환경 변수 확인
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    console.error('');
    console.error('실행 예시:');
    console.error('SUPABASE_URL="https://xxx.supabase.co" SUPABASE_ANON_KEY="xxx" node scripts/seed-historical-data.mjs');
    process.exit(1);
  }

  try {
    // 1. API에서 데이터 가져오기
    const records = await fetchAllFngData();

    // 2. Supabase에 적재
    await upsertToSupabase(records);

    console.log('\n🎉 히스토리 데이터 적재 완료!');
    console.log(`   - 시작일: ${records[records.length - 1].timestamp}`);
    console.log(`   - 종료일: ${records[0].timestamp}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();
