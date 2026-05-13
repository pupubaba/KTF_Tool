# KTF 운영툴

KTF 게임 서버를 위한 웹 기반 어드민 대시보드입니다.  
유저 제재/관리, 우편 발송 등 운영 업무를 브라우저에서 처리할 수 있습니다.

## 화면 구성

| 페이지 | 설명 |
|--------|------|
| 로그인 | 게임 서버 계정으로 JWT 인증 |
| 유저 관리 | 블랙/정지/화이트/정상화 처리, 블랙리스트 조회, 우편함 조회 |
| 우편 발송 | 단건 발송 (gettingItem/Count 직접 입력), 일괄 발송 (아이템 빌더) |

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

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build
```

## Docker 배포

```bash
# 이미지 빌드
docker build -t ktf-admin-tool .

# 컨테이너 실행 (포트 80)
docker run -d -p 80:80 --name ktf-admin ktf-admin-tool
```

브라우저에서 `http://localhost` 접속

### 업데이트

```bash
docker stop ktf-admin && docker rm ktf-admin
docker build -t ktf-admin-tool .
docker run -d -p 80:80 --name ktf-admin ktf-admin-tool
```

## 서버 연결 설정

로그인 화면에서 **서버 선택** (로컬 / 운영) 및 **URL 직접 입력**이 가능합니다.  
선택한 서버 정보는 사이드바에서도 전환할 수 있습니다.

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
│   ├── client.ts       # Axios 인스턴스 (baseURL 동적 설정)
│   └── endpoints.ts    # API 호출 함수
├── components/
│   └── Layout.tsx      # 사이드바 레이아웃
├── contexts/
│   └── AppContext.tsx   # 서버 선택·JWT·유저 정보 전역 상태
├── pages/
│   ├── LoginPage.tsx   # 로그인
│   ├── UsersPage.tsx   # 유저 관리
│   └── MailPage.tsx    # 우편 발송
└── types/
    └── index.ts        # 공통 타입 정의
```

## 연동 API

> 게임 서버: `D:\KTF_SERVER` (Spring Boot)

| 엔드포인트 | 설명 |
|-----------|------|
| `POST /auth/Login` | JWT 발급 |
| `POST /api/Test/User/BlackUser` | 유저 블랙 처리 |
| `POST /api/Test/User/StopUser` | 유저 정지 |
| `POST /api/Test/User/WhiteUser` | 화이트리스트 등록 |
| `POST /api/Test/User/NormalUser` | 제재 해제 |
| `GET /api/Test/User/BlackList` | 블랙리스트 조회 |
| `POST /api/Test/Mail/GetMyMailBox` | 유저 우편함 조회 |
| `POST /api/Test/Mail/SendMail` | 단건 우편 발송 |
| `POST /api/Test/Mail/SendMailList` | 일괄 우편 발송 |
