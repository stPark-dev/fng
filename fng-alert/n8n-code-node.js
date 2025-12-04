/**
 * =============================================================================
 * Fear & Greed Index - n8n Code Node (Transform Layer)
 * =============================================================================
 *
 * 목적: Alternative.me API 응답을 파싱하고 알림 조건을 판단
 *
 * 입력: HTTP Request 노드에서 받은 API 응답
 *       - API: https://api.alternative.me/fng/?limit=2
 *       - limit=2로 오늘 + 어제 데이터 수신
 *
 * 출력: Supabase INSERT + Telegram 알림용 JSON
 * =============================================================================
 */

// =============================================================================
// 설정값 (Configuration)
// =============================================================================

const CONFIG = {
  // 알림 발송 임계값
  EXTREME_FEAR_THRESHOLD: 20,    // 이하면 Extreme Fear
  EXTREME_GREED_THRESHOLD: 80,   // 이상이면 Extreme Greed
  SIGNIFICANT_CHANGE: 15,        // 전일 대비 이 이상 변동 시 알림

  // 지수별 이모지 매핑
  EMOJI_MAP: {
    'Extreme Fear': '😱',
    'Fear': '😨',
    'Neutral': '😐',
    'Greed': '🤑',
    'Extreme Greed': '🚀',
  },
};

// =============================================================================
// 유틸리티 함수
// =============================================================================

/**
 * Unix timestamp를 ISO 8601 형식으로 변환
 * @param {string|number} unixTimestamp - Unix timestamp (초 단위)
 * @returns {string} ISO 8601 형식 문자열
 */
const unixToISO = (unixTimestamp) => {
  const ts = typeof unixTimestamp === 'string'
    ? parseInt(unixTimestamp, 10)
    : unixTimestamp;
  return new Date(ts * 1000).toISOString();
};

/**
 * 안전한 정수 변환
 * @param {any} value - 변환할 값
 * @param {number} defaultValue - 기본값
 * @returns {number}
 */
const safeParseInt = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

/**
 * 지수 분류에 따른 이모지 반환
 * @param {string} classification - value_classification
 * @returns {string} 이모지
 */
const getEmoji = (classification) => {
  return CONFIG.EMOJI_MAP[classification] || '📊';
};

/**
 * 변동 방향 이모지
 * @param {number} change - 변동폭
 * @returns {string}
 */
const getChangeEmoji = (change) => {
  if (change > 0) return '📈';
  if (change < 0) return '📉';
  return '➡️';
};

// =============================================================================
// 메인 로직
// =============================================================================

try {
  // ---------------------------------------------------------------------------
  // Step 1: 입력 데이터 추출
  // ---------------------------------------------------------------------------

  const inputItems = $input.all();

  if (!inputItems || inputItems.length === 0) {
    throw new Error('No input data received from HTTP Request node');
  }

  // Input Structure Expectation:
  // Item 0: { json: { fng: {...}, prices: {...}, ai_summary: "..." } }
  // OR separate items if merged differently. Assuming merged into one item for simplicity.
  
  // For this implementation, we assume the previous node (Merge) outputs:
  // {
  //    "fng": { "data": [...] },
  //    "prices": { "bitcoin": { "usd": 12345 }, "ethereum": { "usd": 1234 } },
  //    "ai_summary": "Market is volatile..."
  // }
  
  const inputJson = inputItems[0].json;
  const fngData = inputJson.fng?.data;
  const prices = inputJson.prices;
  const aiComment = inputJson.ai_summary || null;

  if (!Array.isArray(fngData) || fngData.length < 2) {
    throw new Error(`Invalid API response: expected at least 2 data points, got ${fngData?.length || 0}`);
  }

  // ---------------------------------------------------------------------------
  // Step 2: 오늘/어제 데이터 파싱
  // ---------------------------------------------------------------------------

  // API는 최신 데이터가 index 0 (오늘), index 1 (어제)
  const todayRaw = fngData[0];
  const yesterdayRaw = fngData[1];

  const todayVal = safeParseInt(todayRaw.value);
  const yesterdayVal = safeParseInt(yesterdayRaw.value);
  const todayClassification = todayRaw.value_classification || 'Unknown';

  // Price Data
  const btcPrice = prices?.bitcoin?.usd || null;
  const ethPrice = prices?.ethereum?.usd || null;

  // ---------------------------------------------------------------------------
  // Step 3: 변동폭 계산
  // ---------------------------------------------------------------------------

  const change = todayVal - yesterdayVal;
  const absChange = Math.abs(change);

  // ---------------------------------------------------------------------------
  // Step 4: 알림 조건 판단
  // ---------------------------------------------------------------------------

  const isExtremeFear = todayVal <= CONFIG.EXTREME_FEAR_THRESHOLD;
  const isExtremeGreed = todayVal >= CONFIG.EXTREME_GREED_THRESHOLD;
  const isSignificantChange = absChange >= CONFIG.SIGNIFICANT_CHANGE;

  const shouldAlert = isExtremeFear || isExtremeGreed || isSignificantChange;

  // ---------------------------------------------------------------------------
  // Step 5: 알림 메시지 생성 (Telegram Markdown 형식)
  // ---------------------------------------------------------------------------

  let alertMessage = '';

  if (shouldAlert) {
    const emoji = getEmoji(todayClassification);
    const changeEmoji = getChangeEmoji(change);
    const changeSign = change >= 0 ? '+' : '';

    // 알림 타입 및 행동 메시지 결정
    let alertType = '';
    let actionMessage = '';

    if (isExtremeFear) {
      alertType = '🔥 *극단적 공포 = 매수 기회!*';
      actionMessage = [
        '',
        '💡 *"공포에 사고, 환호에 팔아라"*',
        '⚔️ 전군 돌격 준비! 남들이 팔 때 사라!',
      ].join('\n');
    } else if (isExtremeGreed) {
      alertType = '⚠️ *극단적 탐욕 = 차익실현 타이밍!*';
      actionMessage = [
        '',
        '💡 *"환호할 때 팔아라"*',
        '🛡️ 수익 확보하고 현금 비중 늘려라!',
      ].join('\n');
    } else if (isSignificantChange) {
      alertType = '⚡ *급격한 변동 감지*';
      actionMessage = [
        '',
        '💡 시장 변동성 주시 필요',
      ].join('\n');
    }
    
    // AI Comment Section
    const aiSection = aiComment ? `\n🤖 *AI Market Insight*:\n_${aiComment}_` : '';
    
    // Price Section
    const priceSection = (btcPrice && ethPrice) 
      ? `\n💰 *BTC*: $${btcPrice.toLocaleString()} | *ETH*: $${ethPrice.toLocaleString()}` 
      : '';

    alertMessage = [
      alertType,
      '',
      `${emoji} *Fear & Greed Index*`,
      `━━━━━━━━━━━━━━━`,
      `📊 현재 지수: *${todayVal}* (${todayClassification})`,
      `${changeEmoji} 전일 대비: *${changeSign}${change}*`,
      `📅 어제 지수: ${yesterdayVal}`,
      priceSection,
      aiSection,
      actionMessage,
      '',
      `⏰ ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
    ].join('\n');
  }

  // ---------------------------------------------------------------------------
  // Step 6: Output 구성
  // ---------------------------------------------------------------------------

  const output = {
    // Supabase INSERT용 데이터
    db_record: {
      value: todayVal,
      value_classification: todayClassification,
      timestamp: unixToISO(todayRaw.timestamp),
      btc_price: btcPrice,
      eth_price: ethPrice,
      ai_comment: aiComment,
    },

    // 알림 판단 결과
    should_alert: shouldAlert,
    alert_message: alertMessage,

    // 분석용 메타데이터 (디버깅/로깅)
    analysis: {
      today_val: todayVal,
      yesterday_val: yesterdayVal,
      change: change,
      is_extreme_fear: isExtremeFear,
      is_extreme_greed: isExtremeGreed,
      is_significant_change: isSignificantChange,
    },
  };

  // n8n 표준 출력 형식
  return [{ json: output }];

} catch (error) {
  // ---------------------------------------------------------------------------
  // 에러 핸들링: 파이프라인 중단 방지
  // ---------------------------------------------------------------------------

  console.error('[FNG ETL] Transform error:', error.message);

  return [{
    json: {
      _error: true,
      _error_message: error.message,
      _error_timestamp: new Date().toISOString(),
      should_alert: false,
      alert_message: '',
    }
  }];
}

// =============================================================================
// n8n 워크플로우 연결 가이드
// =============================================================================
/*
 * [워크플로우 구조]
 *
 * 1. Schedule Trigger (매일 09:00 KST)
 *    └─ Cron: 0 9 * * *  (Timezone: Asia/Seoul)
 *
 * 2. HTTP Request (API 호출)
 *    └─ URL: https://api.alternative.me/fng/?limit=2
 *    └─ Method: GET
 *
 * 3. Code Node (이 코드)
 *    └─ 파싱 + 알림 조건 판단
 *
 * 4. Supabase Node (DB 적재)
 *    └─ Table: fng_logs
 *    └─ Operation: Insert
 *    └─ Columns: {{ $json.db_record }}
 *    └─ On Conflict: Do Nothing (timestamp 기준 중복 방지)
 *
 * 5. IF Node (알림 분기)
 *    └─ Condition: {{ $json.should_alert }} === true
 *
 * 6. Telegram Node (알림 발송) - IF가 true일 때만
 *    └─ Chat ID: @your_channel 또는 개인 chat_id
 *    └─ Text: {{ $json.alert_message }}
 *    └─ Parse Mode: Markdown
 */
