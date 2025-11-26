# Fear & Greed Index Project

Crypto Fear & Greed Index 대시보드 및 알림 시스템

## 프로젝트 구조

```
├── fng-alert/        # n8n 워크플로우 코드 (Telegram 알림)
├── fng-dashboard/    # Next.js 대시보드 애플리케이션
└── n8n-compose/      # n8n Docker Compose 설정
```

## fng-alert

n8n 워크플로우용 코드 노드 스크립트. Alternative.me API에서 Fear & Greed Index를 가져와 Supabase에 저장하고 Telegram으로 알림을 전송합니다.

### 주요 기능
- 일일 Fear & Greed Index 수집
- Supabase 데이터 저장
- Telegram 알림 (투자 조언 포함)

## fng-dashboard

다크 판타지 테마의 Fear & Greed Index 대시보드.

### 기술 스택
- Next.js 15
- TypeScript
- Tailwind CSS
- Recharts
- Supabase

### 주요 기능
- 실시간 Fear & Greed Index 표시
- 30일/1년/2년 히스토리 차트
- 연간 최고/최저 통계
- 다국어 지원 (한국어/영어)
- 다크 판타지 UI 테마

### 로컬 실행

```bash
cd fng-dashboard
npm install
npm run dev
```

### 환경 변수

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## n8n-compose

n8n 자동화 플랫폼을 위한 Docker Compose 설정.

### 실행

```bash
cd n8n-compose
docker-compose up -d
```

## 라이선스

MIT
