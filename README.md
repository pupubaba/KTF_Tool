# KTF 운영툴

KTF 게임 서버를 위한 웹 기반 어드민 대시보드입니다.
유저 조회/제재, 우편 발송, 실시간 랭킹, 게임 지표, 관리자 계정 관리 등 운영 업무를 브라우저에서 처리할 수 있습니다.

## 화면 구성

| 페이지 | 경로 | 접근 권한 | 설명 |
|--------|------|-----------|------|
| 로그인 | `/login` | 비인증 | 게임 서버 계정으로 JWT 인증 |
| 유저 관리 | `/users` | ADMIN / PM | 유저 검색(닉네임/소셜ID/ID), 제재·해제, 레벨 변경, 재화·영웅·가이드·결제·상점·우편함·던전 기록 조회 |
| 우편 발송 | `/mail` | ADMIN / PM | 단건 발송 (직접 입력), 일괄 발송 (아이템 빌더) |
| 실시간 랭킹 | `/ranking` | ADMIN / PM | 데미지 던전 / 길드 / 길드 보스 랭킹 (채널별, Redis 실시간) |
| 일별 게임 지표 | `/metrics` | ADMIN 전용 | DAU/MAU/매출/결제 등 일별 집계 |
| 관리자 계정 | `/admin` | ADMIN 전용 | 운영툴 로그인 계정 생성/삭제 |

사이드바 하단에는 서버 상태(정상/점검) 배지가 항상 표시되며, ADMIN 계정은 상태를 직접 전환할 수 있습니다.

### 유저 관리 탭

`/users` 페이지는 유저를 검색한 뒤 아래 탭에서 상세 정보를 확인합니다. 한 번 불러온 탭 데이터는 다른 탭으로 이동해도 유지되며, 검색한 유저가 바뀌면 모두 초기화됩니다.

| 탭 | 설명 |
|----|------|
| 유저 제재 | 검색, 블랙/정지/화이트/정상화 처리, 레벨 변경(ADMIN) |
| 재화 | 보유 재화 및 일일 한도 |
| 영웅 | 보유 영웅 목록 |
| 가이드 | 가이드 퀘스트 진행 상태, 클리어 가능 설정(ADMIN), 퀘스트 강제 이동(ADMIN) |
| IAP 결제 | Apple/Google/WebShop 결제 이력 (레거시) |
| 인게임 상점 | 현금점/골드점/길드점 등 인게임 구매 로그 |
| 우편함 | 유저 우편함 조회 |
| 던전 | 던전별 최대 기록 조회, 기록 강제 수정(ADMIN) |

레벨 변경, 가이드 클리어/퀘스트 이동, 던전 기록 수정, 서버 상태 전환처럼 되돌리기 어려운 작업은 실행 전 확인 팝업을 거칩니다.

## 기술 스택

- **React 18** + **TypeScript**
- **Vite** — 빌드 도구
- **React Router v6** — 클라이언트 라우팅
- **Axios** — HTTP 클라이언트
- **Nginx** — 프로덕션 서빙 (Docker)

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 타입 체크
npx tsc --noEmit

# 프로덕션 빌드
npm run build
```

## Docker 배포

```bash
# 이미지 빌드
docker build -t ktf-tool:0.0.1 .

# 컨테이너 실행 (nginx는 80포트 — 반드시 -p 3000:80)
docker run -d --name ktf-tool-container -p 3000:80 --net mybridge ktf-tool:0.0.1
```

브라우저에서 `http://localhost:3000` 접속

> Docker 네트워크(`--net mybridge`)는 게임 서버 컨테이너와 동일 네트워크여야 내부 통신이 가능합니다.

### 업데이트

```bash
docker stop ktf-tool-container && docker rm ktf-tool-container
docker build -t ktf-tool:0.0.1 .
docker run -d --name ktf-tool-container -p 3000:80 --net mybridge ktf-tool:0.0.1
```

## 서버 연결 설정

로그인 화면 및 사이드바에서 서버를 선택할 수 있습니다.

| 이름 | URL |
|------|-----|
| 로컬 | `http://localhost:8080` |
| 개발 | `http://172.30.1.32:8081` |
| 운영 | `http://3.38.191.171:8080` |

서버 목록은 `src/contexts/AppContext.tsx`의 `SERVERS` 배열에서 관리하며, 서버 전환 시 JWT가 초기화되고 다시 로그인해야 합니다.

## 우편 아이템 형식

| 타입 | 예시 | 설명 |
|------|------|------|
| `Currency_N` | `Currency_1` | 재화 (N = currencyId) |
| `Character_N` | `Character_1001` | 영웅/캐릭터 (N = heroTableId) |
| `Equipment_N` | `Equipment_112` | 장비 (N = equipmentId) |
| `EquipmentBox_N` | `EquipmentBox_1` | 장비 상자 |
| `ItemBox_N` | `ItemBox_1` | 아이템 상자 |
| `Emblem_N` | `Emblem_3` | 문장 등급 지정 (N = grade) |
| `Emblem` | `Emblem` | 문장 랜덤 지급 |

**단건 발송** — `gettingItem`과 `gettingItemCount`를 콤마 구분으로 직접 입력
```
gettingItem:      Character_1001,Currency_1
gettingItemCount: 1,500
```

**일괄 발송** — 아이템 빌더 또는 `Type_Id:Count` 형식 직접 입력
```
Character_1:1,Character_2:1,Equipment_112:1,Currency_1:500
```

## 프로젝트 구조

```
src/
├── api/
│   ├── client.ts           # Axios 인스턴스 (baseURL 동적 설정)
│   └── endpoints.ts        # API 호출 함수 모음
├── components/
│   ├── Layout.tsx           # 사이드바 레이아웃, 서버 선택/상태
│   └── ItemBuilder.tsx      # 아이템 빌더 (일괄 발송용)
├── contexts/
│   └── AppContext.tsx        # 서버 선택·JWT·유저 정보 전역 상태
├── pages/
│   ├── LoginPage.tsx        # 로그인
│   ├── UsersPage.tsx        # 유저 관리 (탭 라우팅 + 캐시)
│   ├── users/                # 유저 관리 탭 컴포넌트
│   │   ├── ActionTab.tsx
│   │   ├── CurrencyTab.tsx
│   │   ├── HeroTab.tsx
│   │   ├── GuideTab.tsx
│   │   ├── PurchaseTab.tsx
│   │   ├── ShopTab.tsx
│   │   ├── MailboxTab.tsx
│   │   └── DungeonTab.tsx
│   ├── MailPage.tsx         # 우편 발송
│   ├── RankingPage.tsx      # 실시간 랭킹
│   ├── MetricsPage.tsx      # 일별 게임 지표
│   └── AdminPage.tsx        # 관리자 계정 관리
└── types/
    └── index.ts             # 공통 타입 정의
```

## 연동 API

> 게임 서버: `D:\KTF_SERVER` (Spring Boot) · 전체 API 명세: `D:\KTF_TOOL\API_DOCS.md`

모든 API는 Bearer JWT 인증이 필요하며, 로그인만 인증 없이 호출합니다.

| 엔드포인트 | 설명 |
|-----------|------|
| `POST /api/auth/login` | JWT 발급 |
| `GET /api/users` | 유저 검색 (gameName/socialId/id) |
| `POST /api/users/{id}/type` | 유저 제재 상태 변경 |
| `POST /api/users/{id}/level` | 유저 레벨 변경 (ADMIN) |
| `POST /api/currency/myCurrency` | 유저 재화 조회 |
| `POST /api/hero/myHero` | 유저 영웅 목록 조회 |
| `POST /api/Guide/myGuideInfo` | 가이드 퀘스트 조회 |
| `POST /api/Guide/setClearable` | 가이드 클리어 가능 설정 (ADMIN) |
| `POST /api/Guide/setQuest` | 가이드 퀘스트 강제 이동 (ADMIN) |
| `GET /api/dungeon/users/{userId}` | 던전 기록 조회 |
| `PATCH /api/dungeon/users/{userId}` | 던전 기록 수정 (ADMIN) |
| `POST /api/shop/purchaseLog` | IAP 결제 이력 조회 (레거시) |
| `GET /api/shop/purchase-logs/{userId}` | 인게임 상점 구매 로그 조회 |
| `POST /api/mail/getMailBox` | 유저 우편함 조회 |
| `POST /api/mail/send` | 단건 우편 발송 |
| `POST /api/mail/send-list` | 일괄 우편 발송 |
| `GET /api/ranking/*` | 채널/길드/랭킹 조회 |
| `GET /api/metrics/daily` | 일별 게임 지표 조회 (ADMIN) |
| `GET/POST /api/admin/accounts` | 관리자 계정 목록/생성 |
| `DELETE /api/admin/accounts/{id}` | 관리자 계정 삭제 |
| `GET/POST /api/server-status` | 서버 상태 조회/변경 (변경은 ADMIN) |
