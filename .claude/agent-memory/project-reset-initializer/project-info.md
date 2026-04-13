---
name: ppl 프로젝트 기본 정보
description: ppl 프로젝트는 Next.js가 아닌 Express.js 기반 웹 앱. 초기화 시 적용 패턴 기록.
type: project
---

이 프로젝트(`C:\Users\wd\cld\ppl`)는 Next.js가 아닌 Express.js 기반입니다.

**Why:** CLAUDE.md에 Next.js 구조가 기술되어 있었지만, 실제 구현은 Express + 순수 HTML이었음 (주사위 게임 서비스). CLAUDE.md가 오래된 템플릿 기준으로 작성되어 있었으므로 초기화 시 CLAUDE.md도 실제 스택에 맞게 업데이트했음.

**How to apply:** 초기화 전 반드시 package.json과 실제 파일 구조를 확인하여 CLAUDE.md와 일치하는지 검증할 것. 불일치 시 CLAUDE.md를 실제 스택 기준으로 업데이트.

## 기술 스택
- 서버: Express.js (Node.js)
- 뷰: 순수 HTML (views/ 디렉토리)
- 데이터: CSV 파일 (data/ 디렉토리, DB 미사용)
- 세션: express-session

## 보존된 항목 (2026-04-13 초기화)
- `.claude/` 전체 (agents, agent-memory, settings.json, settings.local.json)
- `.mcp.json`
- `CLAUDE.md`, `DICEGAME.md`, `PROJECT.md`
- `package.json`, `package-lock.json`, `node_modules/`

## 제거된 항목 (2026-04-13 초기화)
- `server.js` → 빈 초기 상태로 재생성
- `views/` (index.html, admin.html)
- `data/` (prizes.csv, winners.csv)
- `public/` (css/, js/, images/)
- `test-results/`
- `mcp-shrimp-task-manager/`
- `shrimp_data/`
- `vercel.json`
- `playwright.config.ts`
- `winners.csv`, `prizes.csv` (루트)
