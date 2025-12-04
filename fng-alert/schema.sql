-- =============================================================================
-- Fear & Greed Index ETL - Supabase Database Schema
-- =============================================================================
-- 목적: 가상자산 공포/탐욕 지수 시계열 데이터 저장
-- 데이터 소스: Alternative.me Fear & Greed Index API
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. FNG_LOGS 테이블
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fng_logs (
    -- Primary Key (자동 증가)
    id                    BIGSERIAL PRIMARY KEY,

    -- 공포/탐욕 지수 (0-100)
    value                 INTEGER NOT NULL CHECK (value >= 0 AND value <= 100),

    -- 지수 분류 (API 원본 값)
    -- 'Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'
    value_classification  VARCHAR(20) NOT NULL,

    -- API에서 제공하는 데이터 시점 (Unix timestamp → TIMESTAMPTZ 변환)
    timestamp             TIMESTAMPTZ NOT NULL,

    -- ETL 메타데이터
    ingested_at           TIMESTAMPTZ DEFAULT NOW(),  -- DB 적재 시점
    batch_id              VARCHAR(50),                 -- n8n Execution ID (선택)

    -- Phase 1 Expansion: Price & AI Insight
    btc_price             NUMERIC,                     -- Bitcoin Price (USD)
    eth_price             NUMERIC,                     -- Ethereum Price (USD)
    ai_comment            TEXT                         -- AI Market Summary
);

-- -----------------------------------------------------------------------------
-- 2. INDEX 전략
-- -----------------------------------------------------------------------------

-- (1) 시간 기반 조회 최적화 (가장 빈번한 쿼리 패턴)
-- 예: "최근 30일 데이터 조회", "특정 기간 트렌드 분석"
CREATE INDEX idx_fng_logs_timestamp
    ON fng_logs (timestamp DESC);

-- (2) 중복 방지를 위한 Unique Index (Idempotency)
-- 동일 timestamp 데이터 재삽입 방지 (정확한 시점 기준)
CREATE UNIQUE INDEX idx_fng_logs_timestamp_unique
    ON fng_logs (timestamp);

-- (3) 극단값 필터링 최적화 (알림 히스토리 조회용)
-- 예: "Extreme Fear/Greed 발생 이력"
CREATE INDEX idx_fng_logs_extreme_values
    ON fng_logs (value)
    WHERE value <= 20 OR value >= 80;

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (Supabase 권장)
-- -----------------------------------------------------------------------------

ALTER TABLE fng_logs ENABLE ROW LEVEL SECURITY;

-- 읽기: 모든 사용자 허용
CREATE POLICY "Public read access" ON fng_logs
    FOR SELECT USING (true);

-- 쓰기: Service Role만 허용 (n8n에서 Service Key 사용)
CREATE POLICY "Service role insert" ON fng_logs
    FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. 유용한 VIEW (대시보드용)
-- -----------------------------------------------------------------------------

-- 최근 7일 트렌드 뷰
CREATE OR REPLACE VIEW fng_recent_trend AS
SELECT
    DATE(timestamp) AS date,
    value,
    value_classification,
    value - LAG(value) OVER (ORDER BY timestamp) AS daily_change
FROM fng_logs
WHERE timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;
