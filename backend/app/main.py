from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import levels, sessions, users
from app.core.config import settings
from app.db.init_db import init_db


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
    app.include_router(levels.router, prefix="/api/v1/levels", tags=["levels"])
    app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["sessions"])

    return app


app = create_app()
