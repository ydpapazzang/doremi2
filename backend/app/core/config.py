import os


class Settings:
    def __init__(self) -> None:
        self.app_name = os.getenv("APP_NAME", "Doremi Master API")
        self.api_prefix = os.getenv("API_PREFIX", "/api/v1")
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./doremi.db")
        self.cors_origins = self._parse_cors_origins(
            os.getenv("CORS_ORIGINS", "http://localhost:5173")
        )

    @staticmethod
    def _parse_cors_origins(value: str) -> list[str]:
        return [origin.strip() for origin in value.split(",") if origin.strip()]


settings = Settings()
