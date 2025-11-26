# Technical Decisions

## 왜 매번 API를 호출하지 않고 DB에 적재하는가?

### 1. 데이터 추세 분석 (Trend Analysis)

**문제:** Alternative.me API는 `limit` 파라미터로 과거 데이터를 제공하지만, 분석 관점에서 한계가 있습니다.

```
API 한계:
- 최대 조회 기간 제한 존재
- 매 요청마다 전체 히스토리 재전송 → 비효율
- API 응답 형식이 변경되면 과거 데이터와 일관성 깨짐
```

**해결:** 일별로 DB에 적재하면 다음이 가능합니다.

```sql
-- 1. 이동평균 계산 (7일 평균)
SELECT
    DATE(timestamp) AS date,
    value,
    AVG(value) OVER (ORDER BY timestamp ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7d
FROM fng_logs;

-- 2. 극단값 발생 빈도 분석
SELECT
    DATE_TRUNC('month', timestamp) AS month,
    COUNT(*) FILTER (WHERE value <= 20) AS extreme_fear_days,
    COUNT(*) FILTER (WHERE value >= 80) AS extreme_greed_days
FROM fng_logs
GROUP BY 1;

-- 3. 특정 지수 구간의 지속 기간
SELECT
    value_classification,
    COUNT(*) AS consecutive_days
FROM fng_logs
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY value_classification;
```

**포트폴리오 관점:** "단순 알림"에서 "데이터 기반 인사이트 제공"으로 프로젝트 깊이가 달라집니다.

---

### 2. API 장애 시 백업 (Fault Tolerance)

**시나리오:** 2024년 실제로 Alternative.me API가 약 3시간 다운된 사례가 있습니다.

```
API 장애 발생 시:
┌─────────────────────────────────────────────────────────┐
│ DB 미적재 시                 │ DB 적재 시               │
├─────────────────────────────────────────────────────────┤
│ - 알림 불가                  │ - 어제 데이터로 대체 알림 │
│ - 전일 대비 계산 불가        │ - 추세 분석 계속 가능     │
│ - 사용자 신뢰도 하락         │ - 장애 복구 후 정상화     │
└─────────────────────────────────────────────────────────┘
```

**구현 방식:**

```javascript
// n8n Error Workflow에서 장애 시 fallback
const fallbackQuery = `
  SELECT value, value_classification
  FROM fng_logs
  ORDER BY timestamp DESC
  LIMIT 1
`;
// → 마지막 저장 데이터로 "최근 데이터 기준" 알림 발송
```

---

### 3. 비용 효율성

| 방식 | API 호출 | DB 쿼리 | 월 예상 비용 |
|------|----------|---------|-------------|
| 매번 API 호출 | 1,440회/월 (분당) | - | Rate Limit 위험 |
| DB 적재 후 조회 | 30회/월 (일 1회) | 무제한 | Supabase 무료 티어 충분 |

---

## 결론

DB 적재는 단순 "저장"이 아닌 **데이터 자산화** 전략입니다.

1. **분석 가능성**: SQL 기반 시계열 분석
2. **안정성**: 외부 API 의존도 감소
3. **확장성**: 대시보드, 백테스팅 등 추가 기능 구현 용이

이러한 설계는 "알림 봇"을 "데이터 플랫폼"으로 발전시킬 수 있는 기반이 됩니다.
