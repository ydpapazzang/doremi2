# Doremi Master

`도레미 마스터`는 초등학생을 위한 악보 읽기 및 계이름 학습용 웹 앱입니다.

현재 저장소는 MVP 개발을 시작하기 위한 기본 구조와 기획 문서를 포함합니다.

## Project Structure

```text
doremi/
  frontend/
  backend/
  docs/
  assets/
```

## Docs

- `docs/product/mvp-checklist.md`: MVP 개발 착수 체크리스트
- `docs/frontend/wireframes.md`: 화면별 텍스트 와이어프레임
- `docs/project/next-steps.md`: 권장 초기 개발 순서

## Recommended Next Step

1. `frontend`에 React + Vite + TypeScript 초기화
2. `backend`에 FastAPI 기본 앱 구성
3. 레벨 1 퀴즈 화면과 세션 API를 먼저 연결

## Run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Deploy Env

### Frontend

Set `VITE_API_BASE_URL` to your deployed backend URL.

Example:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

### Backend

Set `DATABASE_URL` and `CORS_ORIGINS`.

Examples:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

## Current Skeleton

- 프론트: 시작 화면, 레벨 선택, 퀴즈, 결과 화면 라우팅 포함
- 백엔드: `users`, `levels`, `sessions` 기본 API 포함
- 백엔드는 현재 메모리 저장소 기반이며, 다음 단계에서 SQLite/SQLAlchemy 실제 저장으로 교체 예정
