# BSSM ALL

부산소프트웨어마이스터고 교사·학생용 통합 관리 데스크톱 앱 (Mac / Windows)

- Tauri 2 + React 19 + Vite + TypeScript
- 백엔드: FastAPI ([MeisterTrack_Back](https://github.com/BSSM-RE-ACT/MeisterTrack_Back))

## 실행

```bash
npm install
cp .env.example .env      # VITE_API_BASE_URL 설정
npm run dev               # 웹으로 확인 (http://localhost:5173)
npx tauri dev             # 데스크톱 앱으로 실행 (Rust 필요)
```

- 공통 컴포넌트 확인: `/#/dev/components`
- 백엔드를 `DEBUG=true`로 띄우고 seed를 넣으면 로그인 화면의 개발용 로그인으로 들어갈 수 있습니다 (`student1@bssm.hs.kr`, `teacher@bssm.hs.kr`)

## 구조

```
src/
  styles/tokens.css   디자인 토큰 (컬러 50~900, 타이포, 간격, 반경, 그림자)
  components/         공통 컴포넌트 (Button, Badge, Card, FilterPill, Table, Modal, Sidebar, Header)
  layouts/            사이드바 + 헤더 앱 셸, 학생/교사 메뉴
  pages/              페이지
  api/                FastAPI 호출 (client), 응답 타입(types), 엔드포인트(endpoints)
  auth/               로그인 상태, 역할별 라우트 보호
src-tauri/            Tauri (Rust) 설정
```
