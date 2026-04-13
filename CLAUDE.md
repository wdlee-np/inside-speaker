# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 및 커뮤니케이션 규칙
- **기본 응답 언어**: 한국어
- **코드 주석**: 한국어로 작성
- **커밋 메시지**: 한국어로 작성
- **문서화**: 한국어로 작성
- **변수명/함수명**: 영어 (코드 표준 준수)

## 주요 명령어

```bash
npm start    # 서버 실행
npm run dev  # 개발 서버 실행
```

## 프로젝트 구조

```
server.js                 # Express 서버 (라우트 및 비즈니스 로직)
views/                    # HTML 뷰 파일
public/                   # 정적 파일 (CSS, JS, 이미지)
├── css/
├── js/
└── images/
data/                     # CSV 데이터 파일 (DB 대체)
```

## 아키텍처 핵심 사항

### 기술 스택
- **서버**: Express.js (Node.js)
- **뷰**: 순수 HTML (템플릿 엔진 없음)
- **데이터**: CSV 파일 기반 (DB 미사용)
- **세션**: express-session

### 데이터 저장 방식
DB를 사용하지 않고 CSV 파일로 데이터를 관리합니다.
- 읽기/쓰기: `csv-parser`, `csv-writer` 라이브러리 사용
- 데이터 파일 위치: `data/` 디렉토리

### 주요 의존성
- **서버**: `express`, `express-session`
- **데이터**: `csv-parser`, `csv-writer`
- **테스트**: `@playwright/test`
