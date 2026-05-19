# 인간공학 프로젝트 - 실험용 웹사이트

LLM 응답 UI(기본 vs 구조화형)가 인지부하에 미치는 영향을 비교하는 within-subject 실험을 위한 웹앱입니다.

## 빠른 시작 (로컬 개발)

```bash
npm install
cp .env.example .env.local
# .env.local 안의 SHEET_API_URL을 채워넣으세요 (없어도 폴백 콘텐츠로 동작합니다)
npm run dev
# http://localhost:3000
```

## 기술 스택

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS 3** (커스텀 디자인 토큰)
- **Zustand** (상태 관리 + sessionStorage 영속화)
- 외부 의존성은 위 3개가 전부

## 페이지 구조

| 경로 | 역할 |
|------|------|
| `/` | 홈, 동의서, 참가자 ID 입력 |
| `/prior-knowledge` | 사전 배경지식 설문 (config로 ON/OFF) |
| `/practice` | UI 사용법 연습 (기록 X) |
| `/reading?q=A1&ui=basic&phase=1` | 읽기 화면 (인터럽션 발동) |
| `/quiz?q=A1&ui=basic&phase=1` | 주관식 퀴즈 |
| `/tlx?q=A1&ui=basic&phase=1` | NASA-TLX 6항목 |
| `/break` | 3분 휴식 타이머 |
| `/survey` | 정성 리뷰 |
| `/done` | 자동 제출 + 백업 다운로드 |
| `/assign` | (디버그용) 현재 그룹 배정 확인 |

## 콘텐츠 수정 방법

### 방법 A. Google Sheet (권장 - 팀원도 가능)
1. `apps-script/Code.gs` 안의 안내대로 시트 생성 + Apps Script 배포
2. Vercel 환경변수 `SHEET_API_URL`, `NEXT_PUBLIC_SHEET_API_URL` 입력
3. 팀원은 시트의 셀만 수정 → ISR(1시간) 후 자동 반영. 즉시 반영하려면 Vercel 대시보드에서 "Redeploy".

### 방법 B. 코드 직접 수정
`data/content.json`을 수정 후 `git push`. Vercel이 자동 빌드/배포(30~60초).

## 설정 변경

`lib/config.ts` 한 파일로 다음을 토글할 수 있습니다.

```ts
COUNTERBALANCE_GROUPS: 2 | 4         // 카운터밸런싱 그룹 수
SHOW_PRIOR_KNOWLEDGE_SURVEY: bool    // 사전 설문 표시 여부
DEFAULT_INTERRUPT_TRIGGER: ...       // 기본 인터럽션 트리거
INTERRUPT_DELAY_MS: 5000             // 트리거 후 모달 발동 지연
BREAK_DURATION_SEC: 180              // 휴식 시간
REQUIRE_DESKTOP: true                // 모바일 차단
```

## 인터럽션 트리거 옵션

URL 쿼리로 런타임 변경 가능: `/reading?...&interrupt=<trigger>`

| 값 | 동작 |
|-----|-----|
| `scroll30` / `scroll40` / `scroll50` | 스크롤이 N% 도달 후 5초 |
| `time45` / `time60` | 페이지 진입 후 N초 |
| `chunk2` | (Structured만) 2번째 청크 펼침 후 5초 |

## 측정 데이터

응답 시트에 한 참가자 = 한 행으로 자동 누적됩니다.

- 식별: `participant_id`, `group`, `ui_order`, `question_order`, `interrupt_in`
- 사전: `prior_grad_descent`, `prior_entropy`
- 각 조건(`q1_*`, `q2_*`):
  - `read_time_ms`, `chunk_open_log`(JSON), `bookmark_log`(JSON)
  - `resumption_lag_ms`, `interrupt_triggered`, `interrupt_trigger_used`, `arithmetic_correct`
  - `quiz_ans1`, `quiz_ans2`, `quiz_time_auto_ms`, `quiz_time_manual_s` (수동은 실험자가 시트에서 직접 입력)
  - `tlx_mental` ~ `tlx_frustration`
- 정성: `pref_ui`, `pref_reason`
- 시각: `started_at`, `submitted_at`

## 배포 (Vercel)

1. GitHub repo에 push
2. [vercel.com](https://vercel.com) → New Project → repo 선택
3. 환경변수 `SHEET_API_URL`, `NEXT_PUBLIC_SHEET_API_URL` 추가
4. Deploy 클릭. `*.vercel.app` URL이 발급됩니다.
5. 이후 `git push`마다 자동 재배포 (30~60초).

## 디자인 시스템 메모

- 컬러: `bg`(연한 회색), `ink`(거의 검정), `muted`(중간 회색), `line`(테두리), `accent`(인디고)
- 모서리: `rounded-xl` / `rounded-2xl`
- 그림자: `shadow-card`, `shadow-soft` (둘 다 매우 옅게)
- 폰트: Inter + 시스템 한국어 폰트 (Pretendard/Apple SD Gothic Neo)
- 컴포넌트: `Card`, `Button`, `Container`, `Stepper`로 통일
