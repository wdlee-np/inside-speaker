# PPLAD PRD - PPL 광고 관리 시스템

## 1. 개요

### 1.1 목적
기존 "영상 퀴즈 서비스"에 **PPL 유료 광고 영상 + 광고 퀴즈 기능**을 추가하기 위한
**관리자(Admin) 전용 광고 관리 시스템**을 구축한다.

> 본 프로젝트는 **사용자 노출 영역은 제외하고**,
> **어드민 기능만 데모 형태로 구현**하는 것을 목표로 한다.

### 1.2 기술 스택
| 영역 | 기술 | 비고 |
|------|------|------|
| 서버 | Express.js (Node.js) | 이미 구성 완료 |
| 데이터 저장 | CSV 파일 | csv-parser, csv-writer 사용 |
| 세션 | express-session | 어드민 인증용 |
| 프론트엔드 | 순수 HTML + CSS + JavaScript | 템플릿 엔진 미사용, res.send() 또는 static HTML |
| 테스트 | Playwright | E2E 테스트 |

> **주의**: DB를 사용하지 않으므로 트랜잭션, 인덱스, JOIN 등 RDBMS 기능은 불가.
> 모든 관계형 데이터 처리는 애플리케이션 레벨에서 수행한다.

---

## 2. 시스템 범위

### 포함
- 캠페인 관리 (CRUD)
- 소재 관리 (CRUD)
- 캠페인 리포트 조회 (데모 데이터 기반)
- 상태 자동 제어 로직

### 제외
- 실제 광고 노출 로직
- 사용자 트래킹 SDK
- 결제 시스템

---

## 3. 데이터 구조 설계

### 3.0 CSV 파일 구성 및 관계 처리 방식

#### CSV 파일 목록
| 파일명 | 설명 | 비고 |
|--------|------|------|
| `data/campaigns.csv` | 캠페인 데이터 | 메인 엔티티 |
| `data/creatives.csv` | 소재 데이터 | campaign_id로 캠페인 참조 |
| `data/report_logs.csv` | 리포트용 데모 로그 데이터 | 시드 데이터로 미리 생성 |

#### CSV 관계 처리 규칙
- **FK 참조**: 소재의 `campaign_id` 필드에 캠페인의 `campaign_id` 값을 문자열로 저장
- **조회 시 JOIN**: 애플리케이션 레벨에서 campaigns.csv와 creatives.csv를 모두 읽어 campaign_id로 매칭
- **삭제 시 CASCADE**: 캠페인 삭제 시 해당 campaign_id를 가진 소재도 함께 삭제
- **데이터 무결성**: 소재 생성 시 campaign_id 존재 여부를 반드시 검증
- **동시성**: 단일 사용자(어드민) 데모이므로 동시 쓰기 충돌은 고려하지 않음

#### ID 생성 규칙
- **campaign_id**: `CAM-{timestamp}-{4자리 랜덤}` (예: `CAM-1713000000000-3A7F`)
- **creative_id**: `CRE-{timestamp}-{4자리 랜덤}` (예: `CRE-1713000000001-B2C4`)

#### CSV 특수 문자 처리 규칙
- **배열 데이터** (quiz_wrong_answers, tags): 파이프(`|`) 문자로 구분하여 단일 셀에 저장
- **HTML 콘텐츠** (quiz_question): 큰따옴표로 셀을 감싸고, 내부 큰따옴표는 이스케이프 처리
- **null 값**: 빈 문자열(`""`)로 저장, 읽을 때 빈 문자열은 null로 변환

---

### 3.1 캠페인 (Campaign) - campaigns.csv

#### 3.1.1 기본 정보 (Meta)
| 필드 | CSV 타입 | 조건 |
|------|----------|------|
| campaign_id | string | 자동 생성, 수정 불가 |
| campaign_name | string | 필수, max 50자 |
| advertiser_name | string | 필수, max 50자 |
| budget | string(정수) | 필수, 0 이상의 정수 |
| agency_name | string | 선택, max 50자, 빈 문자열 허용 |
| priority | string(정수) | 기본값 1, 범위 1~5 |

#### 3.1.2 타겟팅 정보
| 필드 | CSV 타입 | 조건 |
|------|----------|------|
| start_date | string(YYYY-MM-DD) | 필수 |
| end_date | string(YYYY-MM-DD) | 필수, start_date 이상 |
| target_impression | string(정수) | 빈 문자열 = 무제한 |
| gender_target | string | `male` / `female` / 빈 문자열(전체) |
| age_target | string | 예: `20-30`, 빈 문자열 = 전체 |

> **수정**: `start_date`의 "오늘 이후" 제약을 제거함.
> 데모용이므로 과거 날짜도 허용하여 테스트 편의성을 확보한다.
> 수정 시에도 날짜 변경이 가능하며, end_date >= start_date 조건만 검증한다.

#### 3.1.3 전략 설정
| 필드 | CSV 타입 | 조건 |
|------|----------|------|
| daily_limit | string(정수) | 빈 문자열 = 무제한 |
| frequency | string | `campaign_once` / `creative_once` / `daily_once` |

#### 3.1.4 상태 정보
| 필드 | CSV 타입 | 설명 |
|------|----------|------|
| status | string | `normal` / `paused` / `inactive` |

#### 3.1.5 통계 필드
| 필드 | CSV 타입 | 설명 |
|------|----------|------|
| total_completed_impression | string(정수) | 리포트 데모 데이터에서 집계 |
| total_video_impression | string(정수) | 리포트 데모 데이터에서 집계 |

#### 3.1.6 메타 필드
| 필드 | CSV 타입 | 설명 |
|------|----------|------|
| created_at | string(ISO 8601) | 생성 시 자동 기록 |
| updated_at | string(ISO 8601) | 수정 시 자동 갱신 |

---

### 3.2 소재 (Creative) - creatives.csv

| 필드 | CSV 타입 | 조건 |
|------|----------|------|
| creative_id | string | 자동 생성 |
| campaign_id | string | 캠페인 ID 참조 (FK) |
| video_title | string | 필수, max 100자 |
| mux_playback_id | string | 필수 |
| tags | string | 파이프(`\|`) 구분, 예: `음식\|뷰티\|건강` |
| quiz_question | string | 필수, HTML 허용 (CSV 이스케이프 처리) |
| quiz_answer | string | 필수 |
| quiz_wrong_answers | string | 파이프(`\|`) 구분, 예: `오답1\|오답2\|오답3` |
| status | string | `active` / `inactive` |
| created_at | string(ISO 8601) | 생성 시 자동 기록 |
| updated_at | string(ISO 8601) | 수정 시 자동 갱신 |

> **변경**: `quiz_wrong_answers`를 `text[]`에서 파이프 구분 문자열로 변경.
> CSV에는 배열 타입이 없으므로 파이프 구분자를 사용한다.

---

### 3.3 리포트 로그 (Report Log) - report_logs.csv

> **추가된 섹션**: 원본 PRD에서 리포트 데이터의 출처가 누락되어 있었음.
> 실제 사용자 트래킹은 범위 밖이므로, **시드(seed) 데이터**를 미리 생성하여 리포트 화면을 데모한다.

| 필드 | CSV 타입 | 설명 |
|------|----------|------|
| log_id | string | 자동 생성 |
| campaign_id | string | 캠페인 참조 |
| creative_id | string | 소재 참조 |
| log_date | string(YYYY-MM-DD) | 기록 날짜 |
| video_impression | string(정수) | 영상 노출수 |
| completed_impression | string(정수) | 완료 노출수 |
| video_unique_users | string(정수) | 영상 노출 고객수 |
| completed_unique_users | string(정수) | 완료 노출 고객수 |

#### 시드 데이터 생성 전략
- 서버 시작 시 `data/report_logs.csv`가 없으면 자동 생성
- 또는 별도 스크립트(`scripts/seed-reports.js`)로 데모 데이터 생성
- 캠페인별, 소재별, 일별 조합으로 랜덤 수치 생성
- 캠페인의 start_date ~ end_date 범위 내에서 일별 데이터 생성

---

## 4. 비즈니스 룰

### 4.1 캠페인/소재 관계
- 캠페인 당 **최대 10개** 소재 등록 가능
- ~~캠페인 당 최소 1개 이상 소재 필수~~ (아래 4.1.1 참조)

#### 4.1.1 소재 최소 개수 정책 (명확화)

> **변경 사유**: 원본 PRD의 "최소 1개 소재 필수" 규칙은 캠페인 생성 플로우와 충돌함.
> 캠페인을 먼저 생성한 뒤 소재를 추가하는 구조에서는 캠페인 생성 시점에 소재가 0개임.

- **캠페인 생성 시**: 소재 0개 허용. 단, status는 `paused`로 설정 (active 소재 없으므로)
- **캠페인을 `normal`로 활성화하려면**: 최소 1개의 `active` 소재 필요
- **마지막 소재 삭제 시**: 캠페인 status를 자동으로 `paused`로 변경

---

### 4.2 상태 자동 제어

#### 규칙 1: 초기 상태
- 캠페인 생성 시 -> status = `paused` (소재가 없는 상태이므로)
- 소재 생성 시 -> status = `active`
- 첫 active 소재 추가 시 -> 캠페인 status 자동 변경 = `normal`

> **변경**: 원본 PRD는 캠페인 생성 시 `normal`이었으나,
> 소재 0개인 캠페인이 `normal`인 것은 비즈니스 룰 3번과 모순됨.
> `paused`로 생성 후 active 소재 추가 시 `normal`로 전환하는 것이 일관적임.

#### 규칙 2: 자동 비활성화
- 캠페인 내 **모든 소재가 inactive 상태**이거나 **소재가 0개**일 경우
  -> 캠페인 status 자동 변경 = `paused`

#### 규칙 3: 활성화 조건
- 캠페인 status가 `normal`이 되려면
  -> 최소 1개 `active` 소재 필요
- 수동으로 `normal`로 변경 시도 시 active 소재가 없으면 거부

#### 규칙 4: 수동 상태 변경 (추가)
- 어드민이 캠페인 status를 `inactive`로 수동 변경 가능
- `inactive` 캠페인은 어드민이 명시적으로 `normal`로 변경해야 복구 (active 소재 존재 시)
- `inactive`와 `paused`의 차이:
  - `paused`: 시스템이 자동으로 설정 (소재 조건 미충족)
  - `inactive`: 어드민이 의도적으로 비활성화

#### 규칙 5: 캠페인 삭제 처리 (추가)
- 캠페인 삭제 시 해당 캠페인의 **모든 소재도 함께 삭제** (CASCADE)
- 삭제된 캠페인의 리포트 로그 데이터도 함께 삭제
- 삭제는 soft delete가 아닌 **hard delete** (CSV에서 행 제거)

#### 규칙 6: 소재 삭제 처리 (추가)
- 소재 삭제 후 해당 캠페인의 active 소재가 0개가 되면 규칙 2 적용
- 소재 삭제 후 해당 소재의 리포트 로그 데이터도 함께 삭제

---

## 5. 어드민 화면 구조

### 5.1 메뉴 구조

```
PPL 광고 관리
 +-- 캠페인 관리
 +-- 캠페인 리포트
```

> 프론트엔드는 순수 HTML + CSS + JavaScript로 구현.
> 서버에서 HTML 문자열을 생성하여 응답하거나, public/ 디렉토리의 정적 HTML에서 fetch API로 데이터 호출.

---

### 5.2 캠페인 관리 화면

#### 5.2.1 리스트 화면

##### 컬럼
- 캠페인 ID
- 캠페인명
- 광고주
- 상태 (컬러 배지)
- 우선순위
- 노출 시작일 / 종료일
- 누적 완료 노출수
- 누적 영상 노출수
- 소재 개수
- 관리 버튼 (수정 / 삭제)

##### 기능
- 상태별 필터링 (전체 / normal / paused / inactive)
- 캠페인명 또는 광고주명 검색

---

#### 5.2.2 캠페인 등록/수정 화면

##### 섹션 구성

**(1) 메타 정보**
- 캠페인명 (필수)
- 광고주명 (필수)
- 광고비 (필수, 숫자)
- 대행사명 (선택)
- 우선순위 (1~5, 기본값 1)

**(2) 타겟팅**
- 시작일 (date input)
- 종료일 (date input)
- 목표 노출수 (숫자 input + "무제한" 체크박스)
- 성별 타겟팅 (radio: 전체/남성/여성)
- 나이 타겟팅 (text input, 예: 20-30)

**(3) 전략 설정**
- 일 노출 제한 (숫자 input + "무제한" 체크박스)
- 게재빈도 (select)
  - 캠페인 당 1회
  - 소재 당 1회
  - 하루 1회

**(4) 상태 관리 (수정 시에만 노출)**
- 현재 상태 표시
- 상태 변경 (select: normal/paused/inactive)
  - normal 선택 시 active 소재 존재 여부 확인 후 처리

**(5) 소재 관리 (수정 시에만 노출)**

소재 리스트:
- 영상 제목
- 상태 (배지)
- 수정 버튼
- 삭제 버튼 (확인 dialog 포함)

추가 버튼:
- "+ 소재 추가" (최대 10개 제한, 초과 시 비활성화)

---

#### 5.2.3 소재 등록/수정 모달

- 영상 제목 (필수)
- Mux Playback ID (필수)
- 태그 입력 (콤마 또는 파이프 구분, text input)
- 퀴즈 문제 (textarea, HTML 직접 입력 허용)
- 정답 (필수)
- 오답 리스트 (textarea, 줄바꿈으로 구분하여 입력, 최소 1개)
- 상태 (select: active/inactive)

> **변경**: 원본 PRD의 "HTML editor"를 "textarea"로 변경.
> 순수 HTML 프론트엔드에서 WYSIWYG 에디터 구현은 과도한 복잡성.
> HTML 태그를 직접 입력할 수 있는 textarea로 충분.

---

### 5.3 캠페인 리포트

#### 5.3.1 캠페인 선택
- 드롭다운으로 캠페인 선택
- `inactive` 캠페인 제외

#### 5.3.2 리포트 데이터 출처

> **명확화**: 리포트 데이터는 `data/report_logs.csv`의 시드 데이터를 집계하여 표시.
> 실제 트래킹은 범위 밖이므로, 미리 생성된 데모 데이터를 활용한다.

#### 5.3.3 리포트 구성

**(1) 누적 지표** (report_logs.csv에서 해당 캠페인의 전체 합산)
- 완료 노출수 (SUM of completed_impression)
- 영상 노출수 (SUM of video_impression)
- 완료 노출 고객수 (SUM of completed_unique_users)
- 영상 노출 고객수 (SUM of video_unique_users)

**(2) 일별 지표** (report_logs.csv에서 날짜별 GROUP BY)
| 컬럼 | 데이터 |
|------|--------|
| 날짜 | log_date |
| 완료 노출수 | SUM(completed_impression) WHERE log_date |
| 영상 노출수 | SUM(video_impression) WHERE log_date |
| 완료 고객수 | SUM(completed_unique_users) WHERE log_date |
| 영상 고객수 | SUM(video_unique_users) WHERE log_date |

**(3) 소재/일별 지표** (report_logs.csv에서 creative_id + log_date 별)
| 컬럼 | 데이터 |
|------|--------|
| 소재 ID | creative_id |
| 영상 제목 | creatives.csv에서 조회 |
| 날짜 | log_date |
| 완료 노출수 | completed_impression |
| 영상 노출수 | video_impression |
| 완료 고객수 | completed_unique_users |
| 영상 고객수 | video_unique_users |

---

## 6. API 설계

### 6.1 캠페인 API

| Method | Path | 설명 | 비고 |
|--------|------|------|------|
| GET | `/api/campaigns` | 캠페인 목록 조회 | 쿼리: `?status=normal&search=키워드` |
| POST | `/api/campaigns` | 캠페인 생성 | |
| GET | `/api/campaigns/:id` | 캠페인 상세 조회 | 소재 목록 포함 |
| PUT | `/api/campaigns/:id` | 캠페인 수정 | |
| DELETE | `/api/campaigns/:id` | 캠페인 삭제 | 소재 + 로그 CASCADE 삭제 |
| PATCH | `/api/campaigns/:id/status` | 캠페인 상태 변경 | body: `{ "status": "normal" }` |

### 6.2 소재 API

| Method | Path | 설명 | 비고 |
|--------|------|------|------|
| GET | `/api/campaigns/:id/creatives` | 소재 목록 조회 | |
| POST | `/api/campaigns/:id/creatives` | 소재 생성 | 최대 10개 검증 |
| GET | `/api/creatives/:id` | 소재 상세 조회 | |
| PUT | `/api/creatives/:id` | 소재 수정 | |
| DELETE | `/api/creatives/:id` | 소재 삭제 | 삭제 후 캠페인 상태 자동 확인 |

### 6.3 리포트 API

| Method | Path | 설명 | 비고 |
|--------|------|------|------|
| GET | `/api/reports/campaigns/:id` | 캠페인 리포트 조회 | 누적 + 일별 + 소재별 통합 응답 |
| GET | `/api/campaigns/active` | 리포트용 활성 캠페인 목록 | inactive 제외 |

> **변경 사항**:
> - `/api` prefix 추가 (정적 HTML과 API 경로 분리)
> - 캠페인 DELETE 엔드포인트 추가
> - 캠페인 상태 변경 전용 PATCH 엔드포인트 추가
> - 소재 GET (개별), DELETE 엔드포인트 추가
> - 소재 목록 GET 엔드포인트 추가
> - 리포트용 활성 캠페인 목록 엔드포인트 추가

---

### 6.4 API 응답 형식 (추가)

#### 성공 응답
```json
{
  "success": true,
  "data": { ... }
}
```

#### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "캠페인명은 필수입니다.",
    "details": []
  }
}
```

#### 에러 코드 목록
| 코드 | 설명 |
|------|------|
| VALIDATION_ERROR | 입력값 검증 실패 |
| NOT_FOUND | 리소스를 찾을 수 없음 |
| BUSINESS_RULE_VIOLATION | 비즈니스 규칙 위반 (예: active 소재 없이 normal 전환) |
| MAX_LIMIT_EXCEEDED | 최대 개수 초과 (예: 소재 10개 초과) |

---

## 7. 유효성 검증 규칙 (추가)

### 7.1 캠페인 생성/수정 시

| 필드 | 규칙 | 에러 메시지 |
|------|------|-------------|
| campaign_name | 필수, 1~50자 | "캠페인명은 1~50자로 입력해주세요" |
| advertiser_name | 필수, 1~50자 | "광고주명은 1~50자로 입력해주세요" |
| budget | 필수, 0 이상 정수 | "광고비는 0 이상의 숫자로 입력해주세요" |
| priority | 1~5 정수 | "우선순위는 1~5 사이의 값이어야 합니다" |
| start_date | 필수, YYYY-MM-DD | "시작일을 올바른 형식으로 입력해주세요" |
| end_date | 필수, >= start_date | "종료일은 시작일 이후여야 합니다" |
| frequency | 허용된 enum 값 | "유효한 게재빈도를 선택해주세요" |

### 7.2 소재 생성/수정 시

| 필드 | 규칙 | 에러 메시지 |
|------|------|-------------|
| video_title | 필수, 1~100자 | "영상 제목은 1~100자로 입력해주세요" |
| mux_playback_id | 필수 | "Mux Playback ID는 필수입니다" |
| quiz_question | 필수 | "퀴즈 문제는 필수입니다" |
| quiz_answer | 필수 | "정답은 필수입니다" |
| quiz_wrong_answers | 최소 1개 | "오답은 최소 1개 이상 입력해주세요" |
| 소재 개수 | 캠페인당 최대 10개 | "소재는 캠페인당 최대 10개까지 등록 가능합니다" |

---

## 8. UI/UX 가이드

- 필수값에는 `*` 표시
- 숫자 필드에 기본값 제공 (budget: 0, priority: 1)
- 클라이언트 사이드 유효성 검증 (submit 전) + 서버 사이드 검증 (submit 후)
- 상태 컬러 구분
  - `normal` -> 초록색 배지
  - `paused` -> 주황색 배지
  - `inactive` -> 회색 배지
- 삭제 시 확인 다이얼로그 표시 ("정말 삭제하시겠습니까?")
- API 호출 중 로딩 표시
- 에러 발생 시 사용자 친화적 메시지 표시

---

## 9. 프로젝트 파일 구조 (추가)

```
ppl/
+-- server.js                    # Express 서버 진입점
+-- package.json
+-- data/                        # CSV 데이터 파일
|   +-- campaigns.csv
|   +-- creatives.csv
|   +-- report_logs.csv
+-- routes/                      # API 라우트
|   +-- campaigns.js
|   +-- creatives.js
|   +-- reports.js
+-- services/                    # 비즈니스 로직
|   +-- campaignService.js
|   +-- creativeService.js
|   +-- reportService.js
+-- utils/                       # 유틸리티
|   +-- csvHelper.js             # CSV 읽기/쓰기 공통 함수
|   +-- idGenerator.js           # ID 생성
|   +-- validator.js             # 유효성 검증
+-- scripts/                     # 유틸리티 스크립트
|   +-- seed-reports.js          # 리포트 시드 데이터 생성
+-- public/                      # 정적 파일
    +-- index.html               # 메인 SPA 진입점
    +-- css/
    |   +-- style.css
    +-- js/
        +-- app.js               # 라우팅 및 앱 초기화
        +-- api.js               # API 호출 헬퍼
        +-- campaigns.js         # 캠페인 화면 로직
        +-- creatives.js         # 소재 화면 로직
        +-- reports.js           # 리포트 화면 로직
```

---

## 10. 확장 고려사항

- 광고 노출 로그 연동 (report_logs.csv를 실제 트래킹 데이터로 대체)
- CSV에서 SQLite 또는 JSON 파일로 저장소 마이그레이션
- A/B 테스트
- 자동 최적화
- 리타겟팅

---

## 11. 핵심 요약

- 광고 영상 + 퀴즈 PPL 시스템
- 어드민 중심 데모 구현
- **Express.js + CSV 파일 기반** (DB 미사용)
- **순수 HTML 프론트엔드** (프레임워크 미사용)
- 캠페인 + 소재 구조, CSV FK로 관계 관리
- 상태 자동 제어: 소재 존재 여부에 따른 캠페인 상태 연동
- 리포트는 **시드 데이터** 기반 데모 (실제 트래킹 미포함)

---

## 부록 A: 원본 PRD 대비 주요 변경 사항

| 항목 | 원본 PRD | 변경 후 | 변경 사유 |
|------|----------|---------|-----------|
| 기술 스택 | React+Tailwind, PHP(Laravel)/Node, MySQL | Express.js + CSV + 순수 HTML | 실제 프로젝트 환경에 맞춤 |
| 캠페인 초기 status | `normal` | `paused` | 소재 0개 상태에서 normal은 비즈니스 룰 3과 모순 |
| 소재 최소 개수 | 항상 1개 이상 필수 | 생성 시 0개 허용, normal 전환 시 1개 필수 | 생성 플로우와의 충돌 해결 |
| quiz_wrong_answers 타입 | text[] | 파이프 구분 문자열 | CSV에 배열 타입 없음 |
| HTML editor | WYSIWYG editor | textarea | 순수 HTML 환경에서 과도한 복잡성 |
| start_date 제약 | 오늘 이후 | 제약 없음 | 데모 편의성 |
| API 경로 | /campaigns, /creatives | /api/campaigns, /api/creatives | 정적 파일과 API 경로 분리 |
| 누락 API | DELETE 없음, PATCH 없음 | DELETE, PATCH 추가 | CRUD 완성 |
| 리포트 데이터 출처 | 미정의 | report_logs.csv 시드 데이터 | 데이터 출처 명확화 |
| 캠페인 삭제 | 미정의 | CASCADE 삭제 규칙 명시 | 엣지 케이스 처리 |
| API 응답 형식 | 미정의 | 통일된 JSON 형식 명시 | 개발 일관성 |
| 유효성 검증 | "실시간 validation" 언급만 | 필드별 구체적 규칙 명시 | 구현 가이드 역할 |
| 파일 구조 | 미정의 | 상세 디렉토리 구조 제시 | 개발 착수 가이드 |
| 타임스탬프 | 없음 | created_at, updated_at 추가 | 데이터 추적성 확보 |
| ID 생성 규칙 | "자동 생성" | 구체적 형식 명시 | 구현 명확성 |
| CSV 특수문자 처리 | 미정의 | 이스케이프, null 처리 규칙 명시 | CSV 데이터 무결성 |
