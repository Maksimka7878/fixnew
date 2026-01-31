# ============================================
# Fix-Price ETL Pipeline - Configuration
# ============================================
"""
Конфигурация скрипта через переменные окружения.
"""

import os
from dataclasses import dataclass, field
from typing import Optional, List
from pathlib import Path

from dotenv import load_dotenv
from loguru import logger

# Загружаем .env файл
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)


@dataclass(frozen=True)
class Config:
    """Настройки ETL pipeline."""
    
    # ========================================
    # Source Configuration (Fix-Price)
    # ========================================
    FIX_PRICE_BASE_URL: str = field(
        default_factory=lambda: os.getenv('FIX_PRICE_BASE_URL', 'https://fix-price.com')
    )
    FIX_PRICE_CATALOG_URL: str = field(
        default_factory=lambda: os.getenv('FIX_PRICE_CATALOG_URL', 'https://fix-price.com/catalog')
    )
    
    # ========================================
    # Destination API Configuration
    # ========================================
    MY_API_URL: str = field(
        default_factory=lambda: os.getenv('MY_API_URL', '')
    )
    API_TOKEN: str = field(
        default_factory=lambda: os.getenv('API_TOKEN', '')
    )
    API_ENDPOINT_PRODUCTS: str = field(
        default_factory=lambda: os.getenv('API_ENDPOINT_PRODUCTS', '/products')
    )
    API_ENDPOINT_MEDIA_UPLOAD: str = field(
        default_factory=lambda: os.getenv('API_ENDPOINT_MEDIA_UPLOAD', '/media/upload')
    )
    
    # ========================================
    # Concurrency & Performance
    # ========================================
    CONCURRENCY_LIMIT: int = field(
        default_factory=lambda: int(os.getenv('CONCURRENCY_LIMIT', '5'))
    )
    REQUEST_DELAY: float = field(
        default_factory=lambda: float(os.getenv('REQUEST_DELAY', '1.0'))
    )
    HTTP_TIMEOUT: int = field(
        default_factory=lambda: int(os.getenv('HTTP_TIMEOUT', '30'))
    )
    
    # ========================================
    # Retry Configuration
    # ========================================
    MAX_RETRIES: int = field(
        default_factory=lambda: int(os.getenv('MAX_RETRIES', '3'))
    )
    RETRY_DELAY: float = field(
        default_factory=lambda: float(os.getenv('RETRY_DELAY', '2.0'))
    )
    
    # ========================================
    # Playwright Configuration
    # ========================================
    HEADLESS: bool = field(
        default_factory=lambda: os.getenv('HEADLESS', 'true').lower() == 'true'
    )
    BROWSER_TYPE: str = field(
        default_factory=lambda: os.getenv('BROWSER_TYPE', 'chromium')
    )
    
    # ========================================
    # Logging Configuration
    # ========================================
    LOG_LEVEL: str = field(
        default_factory=lambda: os.getenv('LOG_LEVEL', 'INFO')
    )
    LOG_FILE: Optional[str] = field(
        default_factory=lambda: os.getenv('LOG_FILE') or None
    )
    
    # ========================================
    # Data Filtering
    # ========================================
    PRODUCT_SAMPLE_PERCENT: int = field(
        default_factory=lambda: int(os.getenv('PRODUCT_SAMPLE_PERCENT', '50'))
    )
    
    # ========================================
    # Derived Properties
    # ========================================
    @property
    def products_api_url(self) -> str:
        """Полный URL для создания товаров."""
        return f"{self.MY_API_URL.rstrip('/')}{self.API_ENDPOINT_PRODUCTS}"
    
    @property
    def media_upload_url(self) -> str:
        """Полный URL для загрузки медиа."""
        return f"{self.MY_API_URL.rstrip('/')}{self.API_ENDPOINT_MEDIA_UPLOAD}"
    
    @property
    def sample_rate(self) -> float:
        """Коэффициент выборки (0.5 = 50%)."""
        return self.PRODUCT_SAMPLE_PERCENT / 100
    
    @property
    def api_headers(self) -> dict:
        """Заголовки для API запросов."""
        return {
            'Authorization': f'Bearer {self.API_TOKEN}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    @property
    def api_headers_multipart(self) -> dict:
        """Заголовки для multipart запросов (без Content-Type - httpx ставит сам)."""
        return {
            'Authorization': f'Bearer {self.API_TOKEN}',
            'Accept': 'application/json'
        }
    
    def validate(self) -> List[str]:
        """Валидация обязательных настроек."""
        errors = []
        
        if not self.MY_API_URL:
            errors.append("MY_API_URL не задан. Укажите URL вашего API в .env файле.")
        
        if not self.API_TOKEN:
            errors.append("API_TOKEN не задан. Укажите ваш API токен в .env файле.")
        
        if self.CONCURRENCY_LIMIT < 1 or self.CONCURRENCY_LIMIT > 20:
            errors.append("CONCURRENCY_LIMIT должен быть от 1 до 20.")
        
        if self.PRODUCT_SAMPLE_PERCENT < 1 or self.PRODUCT_SAMPLE_PERCENT > 100:
            errors.append("PRODUCT_SAMPLE_PERCENT должен быть от 1 до 100.")
        
        return errors


# Глобальный экземпляр конфигурации
_config: Optional[Config] = None


def get_config() -> Config:
    """Получает или создает экземпляр конфигурации."""
    global _config
    if _config is None:
        _config = Config()
    return _config


def init_config() -> Config:
    """Инициализирует конфигурацию с валидацией."""
    config = get_config()
    errors = config.validate()
    
    if errors:
        logger.error("❌ Ошибки конфигурации:")
        for error in errors:
            logger.error(f"   - {error}")
        raise ValueError("Невалидная конфигурация. Исправьте .env файл.")
    
    logger.info("✅ Конфигурация загружена успешно")
    logger.info(f"   API URL: {config.MY_API_URL}")
    logger.info(f"   Concurrency: {config.CONCURRENCY_LIMIT}")
    logger.info(f"   Sample Rate: {config.sample_rate * 100}%")
    
    return config
