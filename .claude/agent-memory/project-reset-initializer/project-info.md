---
name: insidespeaker 프로젝트 초기화 기록
description: 2026-04-24 초기화 완료. Express.js 기반 PPL 광고 관리 시스템에서 클린 슬레이트로 전환. 새 웹사이트 프로젝트 준비 완료.
type: project
---

## 초기화 이력 (2026-04-24)

2026-04-24에 PPL 광고 관리 시스템(Express.js)을 완전 초기화하여 새 웹사이트 프로젝트 개발 기반 마련.

**Why:** 기존 PPL 광고 관리 데모 시스템을 완전히 교체하고 새 웹사이트 프로젝트를 시작하기 위해.

**How to apply:** 다음 웹사이트 개발 요청 시 기술 스택을 새로 결정하고 CLAUDE.md를 업데이트해야 함.

## 현재 상태 (초기화 후)

현재 남아있는 파일:
- `CLAUDE.md` — 새 프로젝트 안내용으로 내용 교체됨
- `.gitignore` — 정리됨
- `.mcp.json` — MCP 서버 설정 (playwright, google-search, context7, sequential-thinking, shadcn, shrimp-task-manager)
- `.claude/` — settings.json, settings.local.json, agent-memory/, agents/
- `.git/` — git 히스토리
- `mcp-shrimp-task-manager/` — MCP 태스크 매니저 (gitignore 대상)

## 제거된 항목
- server.js, routes/, services/, scripts/, tests/ (Express 서비스 코드)
- public/, data/, lib/ (정적 파일, CSV 데이터, supabase 연결)
- package.json, package-lock.json, node_modules/
- PRD.md, schema.sql, playwright.config.ts, vercel.json
- .env, .env.example, .vercel/, .playwright-mcp/

## 주의사항
- `mcp-shrimp-task-manager/`는 .gitignore 대상이지만 실제 로컬에 존재 — 삭제하지 않음
- `.mcp.json`의 shrimp-task-manager 경로는 `C:/Users/wd/cld/dicegame/` 기준 — 새 프로젝트에서 필요시 경로 확인 필요
