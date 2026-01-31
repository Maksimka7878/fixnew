# ============================================
# Fix-Price ETL Pipeline - API Client
# ============================================
"""
Асинхронный HTTP клиент для взаимодействия с вашим API.
Реализует загрузку товаров и изображений с retry логикой.
"""

import asyncio
from typing import Optional, List, Dict, Any, BinaryIO
from io import BytesIO
import mimetypes

import httpx
from tenacity import (
    retry, 
    stop_after_attempt, 
    wait_exponential, 
    retry_if_exception_type,
    before_sleep_log
)
from loguru import logger

from models import Product, ProductImage, APIResponse
from config import Config



# ========================================
# Exceptions
# ========================================

class APIError(Exception):
    """Кастомное исключение для ошибок API."""
    def __init__(self, message: str, status_code: Optional[int] = None, response_body: Optional[str] = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


class ImageDownloadError(Exception):
    """Исключение при скачивании изображения."""
    pass


# ========================================
# Retry Configuration
# ========================================

def get_default_retry():
    return retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2.0, min=2.0, max=10.0),
        retry=retry_if_exception_type((
            httpx.HTTPStatusError,
            httpx.ConnectError,
            httpx.TimeoutException,
            httpx.NetworkError,
            APIError
        )),
        before_sleep=before_sleep_log(logger, 'warning'),
        reraise=True
    )

RETRY_DECORATOR = get_default_retry()


class APIClient:
    """
    Асинхронный клиент для работы с вашим API.
    Поддерживает retry логику, загрузку изображений и создание товаров.
    """
    
    def __init__(self, config: Config):
        self.config = config
        
        # HTTP клиент с настройками
        limits = httpx.Limits(
            max_keepalive_connections=20,
            max_connections=50
        )
        
        timeout = httpx.Timeout(
            connect=10.0,
            read=config.HTTP_TIMEOUT,
            write=10.0,
            pool=10.0
        )
        
        self.client = httpx.AsyncClient(
            limits=limits,
            timeout=timeout,
            http2=True,
            follow_redirects=True
        )
        
        # Семафор для ограничения concurrency
        self.semaphore = asyncio.Semaphore(config.CONCURRENCY_LIMIT)
        
        logger.info("🌐 API Client инициализирован")
        logger.info(f"   Base URL: {config.MY_API_URL}")
    
    async def close(self):
        """Закрывает HTTP клиент."""
        await self.client.aclose()
        logger.info("🔒 API Client закрыт")
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
    
    # ========================================
    # Retry Configuration
    # ========================================
    
    # ========================================
    # Image Operations
    # ========================================
    
    # ========================================
    # Image Operations
    # ========================================
    
    async def download_image(self, image_url: str) -> tuple[BytesIO, str, int]:
        """
        Скачивает изображение в память (BytesIO).
        
        Args:
            image_url: URL изображения
            
        Returns:
            Кортеж (BytesIO с данными, MIME-тип, размер в байтах)
            
        Raises:
            ImageDownloadError: При ошибке скачивания
        """
        try:
            logger.debug(f"📥 Скачивание изображения: {image_url[:60]}...")
            
            async with self.semaphore:
                response = await self.client.get(
                    image_url,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                )
                response.raise_for_status()
                
                content = response.content
                content_type = response.headers.get('content-type', 'image/jpeg')
                
                # Определяем MIME-тип
                if not content_type or content_type == 'application/octet-stream':
                    content_type, _ = mimetypes.guess_type(image_url)
                    content_type = content_type or 'image/jpeg'
                
                image_buffer = BytesIO(content)
                size_bytes = len(content)
                
                logger.debug(f"✅ Изображение скачано: {size_bytes} bytes, {content_type}")
                
                return image_buffer, content_type, size_bytes
                
        except httpx.HTTPStatusError as e:
            raise ImageDownloadError(f"HTTP {e.response.status_code} при скачивании {image_url}")
        except Exception as e:
            raise ImageDownloadError(f"Ошибка скачивания {image_url}: {str(e)}")
    
    @RETRY_DECORATOR
    async def upload_image(
        self, 
        image_buffer: BytesIO, 
        filename: str,
        content_type: str
    ) -> str:
        """
        Загружает изображение на ваш сервер через multipart/form-data.
        
        Args:
            image_buffer: BytesIO с данными изображения
            filename: Имя файла
            content_type: MIME-тип
            
        Returns:
            URL загруженного изображения на вашем сервере
        """
        logger.debug(f"📤 Загрузка изображения: {filename}")
        
        # Сбрасываем позицию буфера
        image_buffer.seek(0)
        
        # Формируем multipart данные
        files = {
            'file': (filename, image_buffer, content_type)
        }
        
        async with self.semaphore:
            response = await self.client.post(
                self.config.media_upload_url,
                headers=self.config.api_headers_multipart,
                files=files
            )
            
            response.raise_for_status()
            
            result = response.json()
            
            # Пытаемся извлечь URL из разных форматов ответа
            uploaded_url = (
                result.get('url') or 
                result.get('file_url') or 
                result.get('data', {}).get('url') or
                result.get('image_url') or
                result.get('path')
            )
            
            if not uploaded_url:
                raise APIError(
                    f"Не удалось получить URL из ответа API: {result}",
                    response.status_code,
                    response.text
                )
            
            logger.debug(f"✅ Изображение загружено: {uploaded_url[:60]}...")
            return uploaded_url
    
    async def process_product_images(self, product: Product) -> List[str]:
        """
        Скачивает и загружает все изображения товара.
        
        Args:
            product: Объект товара
            
        Returns:
            Список URL загруженных изображений
        """
        uploaded_urls = []
        errors = []
        
        for idx, image in enumerate(product.images):
            try:
                # Скачиваем изображение
                image_buffer, content_type, size_bytes = await self.download_image(image.original_url)
                
                # Генерируем имя файла
                ext = mimetypes.guess_extension(content_type) or '.jpg'
                filename = f"{product.source_id or 'product'}_{idx}{ext}"
                
                # Загружаем на сервер
                uploaded_url = await self.upload_image(image_buffer, filename, content_type)
                
                # Обновляем объект изображения
                image.uploaded_url = uploaded_url
                image.filename = filename
                image.mime_type = content_type
                image.size_bytes = size_bytes
                
                uploaded_urls.append(uploaded_url)
                
                # Небольшая задержка между загрузками
                await asyncio.sleep(0.2)
                
            except Exception as e:
                error_msg = f"Ошибка обработки изображения {image.original_url}: {str(e)}"
                logger.warning(f"⚠️ {error_msg}")
                errors.append(error_msg)
                # Продолжаем с другими изображениями
        
        if errors:
            product.errors.extend(errors)
        
        return uploaded_urls
    
    # ========================================
    # Product Operations
    # ========================================
    
    @RETRY_DECORATOR
    async def create_product(self, product: Product) -> APIResponse:
        """
        Создает товар на вашем сервере через POST запрос.
        
        Args:
            product: Объект товара с заполненными данными
            
        Returns:
            Ответ API
        """
        payload = product.to_api_payload()
        
        logger.debug(f"📤 Создание товара: {product.title[:50]}...")
        
        async with self.semaphore:
            response = await self.client.post(
                self.config.products_api_url,
                headers=self.config.api_headers,
                json=payload
            )
            
            response.raise_for_status()
            
            result = response.json()
            
            # Парсим ответ
            api_response = APIResponse(
                success=result.get('success', True),
                product_id=(
                    result.get('id') or 
                    result.get('product_id') or 
                    result.get('data', {}).get('id')
                ),
                message=result.get('message'),
                errors=result.get('errors')
            )
            
            if api_response.success and api_response.product_id:
                product.api_product_id = api_response.product_id
                product.uploaded_to_api = True
                logger.info(f"✅ Товар создан: ID={api_response.product_id}")
            else:
                logger.warning(f"⚠️ Товар создан с предупреждениями: {api_response.message}")
            
            return api_response
    
    async def process_product(self, product: Product) -> bool:
        """
        Полный цикл обработки товара:
        1. Загрузка изображений
        2. Создание товара на сервере
        
        Args:
            product: Объект товара
            
        Returns:
            True если успешно, False если ошибка
        """
        try:
            logger.info(f"🔄 Обработка товара: {product.title[:50]}...")
            
            # Шаг 1: Загружаем изображения
            if product.images:
                logger.info(f"   📸 Загрузка {len(product.images)} изображений...")
                uploaded_urls = await self.process_product_images(product)
                
                if not uploaded_urls:
                    logger.warning(f"⚠️ Ни одно изображение не загружено для товара")
            
            # Шаг 2: Создаем товар
            api_response = await self.create_product(product)
            
            if api_response.success:
                logger.info(f"✅ Товар успешно обработан: {product.title[:50]}...")
                return True
            else:
                error_msg = f"API вернуло ошибку: {api_response.message or api_response.errors}"
                product.errors.append(error_msg)
                logger.error(f"❌ {error_msg}")
                return False
                
        except Exception as e:
            error_msg = f"Ошибка обработки товара: {str(e)}"
            product.errors.append(error_msg)
            logger.error(f"❌ {error_msg}")
            return False
    
    async def process_products_batch(
        self, 
        products: List[Product],
        progress_callback=None
    ) -> tuple[int, int]:
        """
        Обрабатывает батч товаров с ограничением concurrency.
        
        Args:
            products: Список товаров
            progress_callback: Callback для обновления прогресса
            
        Returns:
            Кортеж (успешно, ошибок)
        """
        success_count = 0
        error_count = 0
        
        async def process_with_limit(product: Product) -> bool:
            result = await self.process_product(product)
            if progress_callback:
                progress_callback()
            return result
        
        # Создаем задачи
        tasks = [process_with_limit(p) for p in products]
        
        # Выполняем
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, bool):
                if result:
                    success_count += 1
                else:
                    error_count += 1
            else:
                logger.error(f"❌ Исключение в задаче: {result}")
                error_count += 1
        
        return success_count, error_count
    
    # ========================================
    # Health Check
    # ========================================
    
    async def health_check(self) -> bool:
        """
        Проверяет доступность API.
        
        Returns:
            True если API доступен
        """
        try:
            # Пробуем GET запрос к базовому URL
            response = await self.client.get(
                self.config.MY_API_URL,
                headers=self.config.api_headers,
                timeout=10.0
            )
            
            # 200 или 404 (если нет корневого эндпоинта) - нормально
            if response.status_code in [200, 404]:
                logger.info("✅ API доступен")
                return True
            else:
                logger.warning(f"⚠️ API вернуло статус {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ API недоступно: {e}")
            return False
