# ============================================
# Fix-Price ETL Pipeline - Data Models
# ============================================
"""
Pydantic модели для валидации данных товаров.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime


class ProductSpecs(BaseModel):
    """Модель характеристик товара."""
    brand: Optional[str] = Field(None, description="Бренд товара")
    weight: Optional[str] = Field(None, description="Вес товара")
    country: Optional[str] = Field(None, description="Страна производства")
    dimensions: Optional[str] = Field(None, description="Размеры товара")
    material: Optional[str] = Field(None, description="Материал")
    additional: Dict[str, Any] = Field(default_factory=dict, description="Дополнительные характеристики")

    def to_dict(self) -> Dict[str, Any]:
        """Конвертирует спецификации в словарь, убирая None значения."""
        return {k: v for k, v in self.model_dump().items() if v is not None}


class ProductImage(BaseModel):
    """Модель изображения товара."""
    original_url: str = Field(..., description="Оригинальный URL изображения с fix-price")
    local_path: Optional[str] = Field(None, description="Локальный путь после скачивания")
    uploaded_url: Optional[str] = Field(None, description="URL после загрузки на ваш сервер")
    filename: Optional[str] = Field(None, description="Имя файла")
    mime_type: Optional[str] = Field(None, description="MIME-тип изображения")
    size_bytes: Optional[int] = Field(None, description="Размер файла в байтах")
    is_primary: bool = Field(False, description="Является ли главным изображением")


class Product(BaseModel):
    """Основная модель товара."""
    
    # --- Идентификация ---
    source_id: Optional[str] = Field(None, description="ID товара на источнике")
    source_url: str = Field(..., description="URL товара на fix-price.com")
    
    # --- Основные данные ---
    title: str = Field(..., min_length=1, description="Название товара")
    description: Optional[str] = Field(None, description="Описание товара")
    
    # --- Цены ---
    price: float = Field(..., ge=0, description="Текущая цена")
    old_price: Optional[float] = Field(None, ge=0, description="Старая цена (если есть скидка)")
    currency: str = Field(default="RUB", description="Валюта")
    
    # --- Категоризация ---
    category: Optional[str] = Field(None, description="Основная категория")
    subcategory: Optional[str] = Field(None, description="Подкатегория")
    categories_path: List[str] = Field(default_factory=list, description="Полный путь категорий")
    
    # --- Характеристики ---
    specs: ProductSpecs = Field(default_factory=ProductSpecs, description="Характеристики товара")
    
    # --- Изображения ---
    images: List[ProductImage] = Field(default_factory=list, description="Список изображений")
    
    # --- Наличие ---
    in_stock: bool = Field(default=True, description="В наличии")
    stock_quantity: Optional[int] = Field(None, ge=0, description="Количество на складе")
    
    # --- Метаданные ---
    sku: Optional[str] = Field(None, description="Артикул/SKU")
    barcode: Optional[str] = Field(None, description="Штрих-код")
    
    # --- Статус обработки ---
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Время создания записи")
    processed: bool = Field(default=False, description="Обработан ли товар")
    uploaded_to_api: bool = Field(default=False, description="Загружен ли на ваш API")
    api_product_id: Optional[str] = Field(None, description="ID товара на вашем сервере")
    errors: List[str] = Field(default_factory=list, description="Ошибки при обработке")

    @field_validator('price', 'old_price', mode='before')
    @classmethod
    def parse_price(cls, v):
        """Парсит цену из строки или числа."""
        if v is None:
            return None
        if isinstance(v, str):
            # Убираем пробелы, заменяем запятую на точку
            v = v.replace(' ', '').replace('\xa0', '').replace(',', '.')
            # Убираем символ валюты
            for char in ['₽', '$', '€', 'руб.', 'RUB', 'USD', 'EUR']:
                v = v.replace(char, '')
            return float(v) if v else 0.0
        return float(v)

    @property
    def discount_percent(self) -> Optional[float]:
        """Вычисляет процент скидки."""
        if self.old_price and self.old_price > self.price:
            return round((self.old_price - self.price) / self.old_price * 100, 2)
        return None

    def to_api_payload(self) -> Dict[str, Any]:
        """Формирует JSON payload для отправки на ваш API."""
        payload = {
            "external_id": self.source_id,
            "source_url": self.source_url,
            "name": self.title,
            "description": self.description,
            "price": self.price,
            "old_price": self.old_price,
            "currency": self.currency,
            "category": self.category,
            "subcategory": self.subcategory,
            "categories_path": self.categories_path,
            "specifications": self.specs.to_dict(),
            "images": [
                {
                    "url": img.uploaded_url or img.original_url,
                    "is_primary": img.is_primary,
                    "filename": img.filename
                }
                for img in self.images if img.uploaded_url or img.original_url
            ],
            "in_stock": self.in_stock,
            "stock_quantity": self.stock_quantity,
            "sku": self.sku,
            "barcode": self.barcode,
            "metadata": {
                "source": "fix-price.com",
                "parsed_at": self.created_at.isoformat(),
                "discount_percent": self.discount_percent
            }
        }
        # Убираем None значения
        return {k: v for k, v in payload.items() if v is not None}


class Category(BaseModel):
    """Модель категории."""
    name: str = Field(..., description="Название категории")
    url: str = Field(..., description="URL категории")
    parent: Optional[str] = Field(None, description="Родительская категория")
    level: int = Field(default=0, description="Уровень вложенности")


class ParsingStats(BaseModel):
    """Модель статистики парсинга."""
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None
    
    # Счетчики
    categories_found: int = 0
    products_found: int = 0
    products_parsed: int = 0
    products_filtered: int = 0  # После применения 50% фильтра
    products_uploaded: int = 0
    products_failed: int = 0
    
    # Ошибки
    errors: List[Dict[str, Any]] = Field(default_factory=list)
    
    @property
    def duration_seconds(self) -> Optional[float]:
        """Длительность выполнения в секундах."""
        if self.finished_at:
            return (self.finished_at - self.started_at).total_seconds()
        return None
    
    @property
    def success_rate(self) -> float:
        """Процент успешно загруженных товаров."""
        if self.products_filtered == 0:
            return 0.0
        return round(self.products_uploaded / self.products_filtered * 100, 2)


class APIResponse(BaseModel):
    """Модель ответа от вашего API."""
    success: bool = Field(..., description="Успешность операции")
    product_id: Optional[str] = Field(None, description="ID созданного товара")
    message: Optional[str] = Field(None, description="Сообщение от API")
    errors: Optional[List[str]] = Field(None, description="Список ошибок")
    media_urls: Optional[List[str]] = Field(None, description="URL загруженных медиа")
