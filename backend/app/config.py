from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./cache.db"
    cache_quotes_ttl_minutes: int = 15
    cache_fundamentals_ttl_hours: int = 24

    model_config = {"env_file": ".env"}


settings = Settings()
