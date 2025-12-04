# Setup Guide

## 워크플로우 구조

```
Schedule (9AM) → HTTP Request → Code Node → Supabase → IF → Telegram
                                                         ↘ No-Op
```

---

## 1. Supabase 설정

### 1.1 프로젝트 생성

1. https://supabase.com 접속 → 로그인
2. "New Project" 클릭
3. 프로젝트명: `fng-alert` (자유)
4. Database Password 설정 (기억해두기)
5. Region: `Northeast Asia (Seoul)` 권장

### 1.2 테이블 생성

1. 좌측 메뉴 → **SQL Editor** 클릭
2. `schema.sql` 내용 복사 → 붙여넣기 → **Run** 클릭

### 1.3 API Key 확인

1. 좌측 메뉴 → **Project Settings** → **API**
2. 복사해둘 값:
   - **Project URL**: `https://xxxx.supabase.co`
   - **service_role key**: `eyJhbGci...` (secret, 노출 금지)

### 1.4 n8n에서 Credential 생성

1. n8n → **Credentials** → **Add Credential**
2. 검색: `Supabase`
3. 입력:
   - **Host**: `https://xxxx.supabase.co` (Project URL)
   - **Service Role Secret**: `eyJhbGci...` (service_role key)
4. **Save**

---

## 2. Telegram Bot 설정

### 2.1 Bot 생성

1. Telegram에서 `@BotFather` 검색 → 대화 시작
2. `/newbot` 입력
3. Bot 이름 입력: `FNG Alert Bot` (자유)
4. Bot username 입력: `fng_alert_aaa_bot` (고유해야 함)
5. **API Token** 복사: `123456789:ABCdefGHI...`

### 2.2 Chat ID 확인

**방법 A: 개인 채팅**

1. 생성한 Bot에게 아무 메시지 전송
2. 브라우저에서 접속:
   ```
   https://api.telegram.org/xxxxxxxxxxxxxxxxxxxxx:xxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. 응답에서 `"chat":{"id":123456789}` 확인
   xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   **방법 B: 채널/그룹**
4. Bot을 채널/그룹에 관리자로 추가
5. 채널에 아무 메시지 작성
6. 위 URL로 확인 (채널은 `-100xxxx` 형식)

### 2.3 n8n에서 Credential 생성

1. n8n → **Credentials** → **Add Credential**
2. 검색: `Telegram`
3. 입력:
   - **Access Token**: `123456789:ABCdefGHI...`
4. **Save**

---

## 3. 워크플로우 Import

### 3.1 Import

1. n8n → **Workflows** → **Import from File**
2. `workflow.json` 선택

### 3.2 Credential 연결

Import 후 아래 노드에서 credential 연결 필요:

| 노드                | Credential   |
| ------------------- | ------------ |
| Save to Supabase    | Supabase API |
| Send Telegram Alert | Telegram Bot |

### 3.3 Chat ID 수정

1. **Send Telegram Alert** 노드 클릭
2. **Chat ID** 필드에 본인 Chat ID 입력

---

## 4. 테스트

### 4.1 수동 실행

1. 워크플로우 열기
2. **Execute Workflow** 클릭 (또는 `Ctrl+Enter`)
3. 각 노드 초록색 체크 확인

### 4.2 확인 사항

- [ ] Supabase → Table Editor → `fng_logs`에 데이터 적재됨
- [ ] 알림 조건 충족 시 Telegram 메시지 수신됨

### 4.3 강제 알림 테스트

Code Node에서 임시로 수정:

```javascript
const shouldAlert = true; // 강제 알림
```

테스트 후 원복 필수!

---

## 5. 활성화

1. 워크플로우 우상단 **Active** 토글 ON
2. 매일 오전 9시(KST)에 자동 실행됨

---

## Troubleshooting

| 증상              | 원인                | 해결                    |
| ----------------- | ------------------- | ----------------------- |
| Supabase 401 에러 | 잘못된 API Key      | service_role key 확인   |
| Supabase 409 에러 | 중복 데이터         | 정상 (idempotency 동작) |
| Telegram 400 에러 | 잘못된 Chat ID      | getUpdates로 재확인     |
| Telegram 401 에러 | 잘못된 Token        | BotFather에서 재발급    |
| 스케줄 미실행     | n8n 컨테이너 중지됨 | `docker ps` 확인        |
