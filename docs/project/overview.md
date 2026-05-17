# Project Overview

## Goal

곧나가요는 카페 방문 예정자가 "지금 가면 앉을 수 있을지"와 "곧 자리가 날지"를 판단할 수 있도록, 카페 안에 있는 사용자의 짧은 퇴장 예정 제보를 모으는 서비스다.

## Target Users

- 유명 카페나 작업하기 좋은 카페를 방문하기 전에 자리 가능성을 확인하고 싶은 사람
- 카페에서 곧 나갈 예정이고 자신의 자리 정보를 가볍게 공유하려는 사람

## Problem

지도와 리뷰 서비스는 위치, 평점, 분위기를 알려주지만 실시간에 가까운 자리 가능성은 알려주기 어렵다. 카페 안에 있는 사람은 유용한 자리 정보를 갖고 있지만, 밖에 있는 방문 예정자에게 전달할 간단한 방법이 없다.

## Core Features

- 네이버 지역 검색 API 기반 카페 검색
- 방문자용 카페별 최근 자리 제보 확인
- 퇴장 예정자용 "곧 나가요" 제보 등록
- 제보 기반 카페별 요약 문장 제공
- Naver API 키가 없을 때 샘플 카페로 로컬 체험

## Non-goals

The project will not focus on:

- 예약, 결제, 좌석 지정
- 로그인과 사용자 평판 시스템
- 모든 카페의 정확한 실시간 좌석 수 산출
- 지도 위 실시간 좌석 렌더링
- 외부 AI API 연동

## Current Status

Release1 MVP implemented as a Vite React TypeScript client with shadcn/ui components and a Fastify TypeScript API server. Cafe reports now persist in Supabase Postgres when configured, while local development can still fall back to in-memory storage.

## Project Structure

```text
/client - frontend application
/server - backend application
/docs   - project documentation, task board, logs, and decisions
```
