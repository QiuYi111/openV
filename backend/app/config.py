from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "OpenV SaaS API"
    SECRET_KEY: str = "supersecret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./openv.db"
    
    # Postgres configuration (optional, defaults to SQLite if not provided)
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_HOST: Optional[str] = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: Optional[str] = None

    @property
    def sync_database_url(self) -> str:
        if self.POSTGRES_DB:
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return self.DATABASE_URL

    DOCKER_BASE_PATH: str = "/tmp/openv_projects"
    DEFAULT_IMAGE: str = "openv-env:latest"
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Allows overriding via .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    ENVIRONMENT: str = "development"

    def model_post_init(self, __context):
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY == "supersecret":
                raise ValueError("ERROR: You must set a strong SECRET_KEY in production mode!")
            if self.SECRET_KEY == "change_me_in_prod": # Just in case
                 raise ValueError("ERROR: You must set a strong SECRET_KEY in production mode!")

@lru_cache()
def get_settings():
    return Settings()
