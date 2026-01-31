# ============================================
# Fix-Price ETL Pipeline - Main Pipeline
# ============================================
"""
Главный ETL Pipeline - оркестратор процесса парсинга и загрузки.
"""

import asyncio
import sys
from pathlib import Path
from typing import List, Optional, Callable
from datetime import datetime

from loguru import logger
from tqdm import tqdm

from config import Config, init_config
from models import Product, Category, ParsingStats
from scraper import FixPriceScraper
from api_client import APIClient


class FixPriceETLPipeline:
    """
    Главный ETL Pipeline для парсинга fix-price.com и загрузки на ваш сервер.
    
    Этапы работы:
    1. EXTRACT: Парсинг категорий и товаров с fix-price.com
    2. TRANSFORM: Фильтрация 50% товаров, валидация данных
    3. LOAD: Загрузка изображений и создание товаров на вашем API
    """
    
    def __init__(self, config: Config):
        self.config = config
        self.stats = ParsingStats()
        self.scraper: Optional[FixPriceScraper] = None
        self.api_client: Optional[APIClient] = None
        
        # Настройка логирования
        self._setup_logging()
    
    def _setup_logging(self):
        """Настраивает логирование через loguru."""
        # Удаляем стандартный handler
        logger.remove()
        
        # Добавляем вывод в консоль с цветами
        logger.add(
            sys.stdout,
            level=self.config.LOG_LEVEL,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
                   "<level>{level: <8}</level> | "
                   "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
                   "<level>{message}</level>",
            colorize=True
        )
        
        # Добавляем файл логов если указан
        if self.config.LOG_FILE:
            log_path = Path(self.config.LOG_FILE)
            log_path.parent.mkdir(parents=True, exist_ok=True)
            
            logger.add(
                self.config.LOG_FILE,
                level=self.config.LOG_LEVEL,
                format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
                rotation="10 MB",
                retention="7 days",
                compression="zip"
            )
    
    async def __aenter__(self):
        """Инициализация компонентов."""
        logger.info("=" * 60)
        logger.info("🚀 Fix-Price ETL Pipeline - Запуск")
        logger.info("=" * 60)
        
        # Инициализируем скрапер
        self.scraper = FixPriceScraper(self.config)
        await self.scraper.init_browser()
        
        # Инициализируем API клиент
        self.api_client = APIClient(self.config)
        
        # Проверяем доступность API
        if not await self.api_client.health_check():
            logger.warning("⚠️ API недоступно, продолжаем в режиме парсинга только")
        
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Закрытие компонентов."""
        if self.scraper:
            await self.scraper.close()
        if self.api_client:
            await self.api_client.close()
        
        # Финальная статистика
        self.stats.finished_at = datetime.utcnow()
        self._print_final_stats()
    
    def _print_final_stats(self):
        """Выводит финальную статистику."""
        logger.info("=" * 60)
        logger.info("📊 Финальная статистика")
        logger.info("=" * 60)
        logger.info(f"⏱️  Длительность: {self.stats.duration_seconds:.1f} секунд")
        logger.info(f"📂 Категорий найдено: {self.stats.categories_found}")
        logger.info(f"📦 Товаров найдено: {self.stats.products_found}")
        logger.info(f"🔍 Товаров распарсено: {self.stats.products_parsed}")
        logger.info(f"🎯 Товаров отфильтровано (50%): {self.stats.products_filtered}")
        logger.info(f"✅ Товаров загружено: {self.stats.products_uploaded}")
        logger.info(f"❌ Ошибок: {self.stats.products_failed}")
        logger.info(f"📈 Успешность: {self.stats.success_rate}%")
        
        if self.stats.errors:
            logger.info(f"\n⚠️  Ошибки ({len(self.stats.errors)}):")
            for error in self.stats.errors[:10]:  # Показываем первые 10
                logger.info(f"   - {error}")
        
        logger.info("=" * 60)
    
    # ========================================
    # EXTRACT Phase
    # ========================================
    
    async def extract_categories(self) -> List[Category]:
        """
        Этап EXTRACT: Получение списка категорий.
        
        Returns:
            Список категорий
        """
        logger.info("\n" + "=" * 60)
        logger.info("📥 ЭТАП 1: EXTRACT - Получение категорий")
        logger.info("=" * 60)
        
        categories = await self.scraper.get_categories()
        self.stats.categories_found = len(categories)
        
        logger.info(f"✅ Найдено категорий: {len(categories)}")
        for cat in categories[:10]:  # Показываем первые 10
            logger.info(f"   - {cat.name}: {cat.url}")
        
        if len(categories) > 10:
            logger.info(f"   ... и еще {len(categories) - 10}")
        
        return categories
    
    async def extract_products_from_categories(
        self, 
        categories: List[Category],
        max_products_per_category: Optional[int] = None
    ) -> List[str]:
        """
        Этап EXTRACT: Получение URL товаров из категорий.
        
        Args:
            categories: Список категорий
            max_products_per_category: Макс. товаров на категорию
            
        Returns:
            Список URL товаров
        """
        logger.info("\n" + "=" * 60)
        logger.info("📥 ЭТАП 1: EXTRACT - Получение товаров из категорий")
        logger.info("=" * 60)
        
        all_product_urls = []
        
        # Прогресс-бар для категорий
        with tqdm(total=len(categories), desc="📂 Категории", unit="cat") as pbar:
            for category in categories:
                try:
                    urls = await self.scraper.get_products_from_category(
                        category.url,
                        max_pages=max_products_per_category // 24 if max_products_per_category else None
                    )
                    
                    all_product_urls.extend(urls)
                    pbar.update(1)
                    pbar.set_postfix({"products": len(all_product_urls)})
                    
                    # Задержка между категориями
                    await asyncio.sleep(self.config.REQUEST_DELAY)
                    
                except Exception as e:
                    logger.error(f"❌ Ошибка при обработке категории {category.name}: {e}")
                    self.stats.errors.append({
                        "category": category.name,
                        "error": str(e)
                    })
                    pbar.update(1)
        
        # Убираем дубликаты
        all_product_urls = list(dict.fromkeys(all_product_urls))
        self.stats.products_found = len(all_product_urls)
        
        logger.info(f"✅ Всего уникальных товаров: {len(all_product_urls)}")
        
        return all_product_urls
    
    async def extract_product_details(self, product_urls: List[str]) -> List[Product]:
        """
        Этап EXTRACT: Парсинг детальной информации о товарах.
        
        Args:
            product_urls: Список URL товаров
            
        Returns:
            Список объектов Product
        """
        logger.info("\n" + "=" * 60)
        logger.info("📥 ЭТАП 1: EXTRACT - Парсинг деталей товаров")
        logger.info("=" * 60)
        
        products = []
        
        # Прогресс-бар
        with tqdm(total=len(product_urls), desc="🔍 Парсинг товаров", unit="product") as pbar:
            def update_progress():
                pbar.update(1)
            
            # Парсим батчами
            batch_size = self.config.CONCURRENCY_LIMIT * 2
            
            for i in range(0, len(product_urls), batch_size):
                batch = product_urls[i:i + batch_size]
                batch_products = await self.scraper.parse_products_batch(batch, update_progress)
                products.extend(batch_products)
                
                logger.info(f"   Прогресс: {len(products)}/{len(product_urls)} товаров")
        
        self.stats.products_parsed = len(products)
        
        logger.info(f"✅ Успешно распарсено: {len(products)} товаров")
        
        return products
    
    # ========================================
    # TRANSFORM Phase
    # ========================================
    
    def transform_filter_products(self, products: List[Product]) -> List[Product]:
        """
        Этап TRANSFORM: Фильтрация 50% товаров.
        
        Args:
            products: Список товаров
            
        Returns:
            Отфильтрованный список (50% от исходного)
        """
        logger.info("\n" + "=" * 60)
        logger.info("🔧 ЭТАП 2: TRANSFORM - Фильтрация товаров")
        logger.info("=" * 60)
        
        # Сортируем по категориям для равномерной выборки
        products_by_category = {}
        for product in products:
            cat = product.category or "Без категории"
            if cat not in products_by_category:
                products_by_category[cat] = []
            products_by_category[cat].append(product)
        
        filtered_products = []
        
        # Применяем 50% фильтр к каждой категории
        for category, cat_products in products_by_category.items():
            # Берем каждый второй товар (even indices: 0, 2, 4...)
            sampled = [p for i, p in enumerate(cat_products) if i % 2 == 0]
            filtered_products.extend(sampled)
            
            logger.info(f"   {category}: {len(cat_products)} → {len(sampled)} товаров")
        
        self.stats.products_filtered = len(filtered_products)
        
        logger.info(f"✅ После фильтрации: {len(filtered_products)} товаров")
        
        return filtered_products
    
    def transform_validate_products(self, products: List[Product]) -> List[Product]:
        """
        Этап TRANSFORM: Валидация и очистка данных.
        
        Args:
            products: Список товаров
            
        Returns:
            Валидированный список
        """
        logger.info("\n" + "=" * 60)
        logger.info("🔧 ЭТАП 2: TRANSFORM - Валидация данных")
        logger.info("=" * 60)
        
        valid_products = []
        invalid_count = 0
        
        for product in products:
            errors = []
            
            # Проверяем обязательные поля
            if not product.title or len(product.title) < 2:
                errors.append("Некорректное название")
            
            if product.price is None or product.price < 0:
                errors.append("Некорректная цена")
            
            if errors:
                product.errors.extend(errors)
                invalid_count += 1
                logger.warning(f"⚠️ Товар {product.source_url} не прошел валидацию: {errors}")
            else:
                valid_products.append(product)
        
        logger.info(f"✅ Валидных товаров: {len(valid_products)}")
        logger.info(f"⚠️  Отклонено: {invalid_count}")
        
        return valid_products
    
    # ========================================
    # LOAD Phase
    # ========================================
    
    async def load_products_to_api(self, products: List[Product]) -> tuple[int, int]:
        """
        Этап LOAD: Загрузка товаров на ваш сервер.
        
        Args:
            products: Список товаров для загрузки
            
        Returns:
            Кортеж (успешно, ошибок)
        """
        logger.info("\n" + "=" * 60)
        logger.info("📤 ЭТАП 3: LOAD - Загрузка на сервер")
        logger.info("=" * 60)
        
        # Прогресс-бар
        with tqdm(total=len(products), desc="📤 Загрузка товаров", unit="product") as pbar:
            def update_progress():
                pbar.update(1)
            
            success_count, error_count = await self.api_client.process_products_batch(
                products, 
                update_progress
            )
        
        self.stats.products_uploaded = success_count
        self.stats.products_failed = error_count
        
        logger.info(f"✅ Успешно загружено: {success_count}")
        logger.info(f"❌ Ошибок: {error_count}")
        
        return success_count, error_count
    
    # ========================================
    # Full Pipeline
    # ========================================
    
    async def run_full_pipeline(
        self,
        categories_limit: Optional[int] = None,
        max_products_per_category: Optional[int] = None
    ):
        """
        Запускает полный ETL pipeline.
        
        Args:
            categories_limit: Ограничение количества категорий (None = все)
            max_products_per_category: Макс. товаров на категорию
        """
        try:
            # ========== EXTRACT ==========
            # 1. Получаем категории
            categories = await self.extract_categories()
            
            if categories_limit:
                categories = categories[:categories_limit]
                logger.info(f"⚙️  Ограничение категорий: {len(categories)}")
            
            # 2. Получаем URL товаров
            product_urls = await self.extract_products_from_categories(
                categories,
                max_products_per_category
            )
            
            # 3. Парсим детали товаров
            products = await self.extract_product_details(product_urls)
            
            # ========== TRANSFORM ==========
            # 4. Фильтруем 50% товаров
            products = self.transform_filter_products(products)
            
            # 5. Валидируем данные
            products = self.transform_validate_products(products)
            
            # ========== LOAD ==========
            # 6. Загружаем на сервер
            if products:
                success, errors = await self.load_products_to_api(products)
                
                # Сохраняем результаты
                await self._save_results(products)
            else:
                logger.warning("⚠️ Нет товаров для загрузки")
            
        except Exception as e:
            logger.exception(f"❌ Критическая ошибка в pipeline: {e}")
            raise
    
    async def _save_results(self, products: List[Product]):
        """Сохраняет результаты в JSON файл."""
        import json
        
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = output_dir / f"etl_results_{timestamp}.json"
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "stats": self.stats.model_dump(),
            "products": [
                {
                    "title": p.title,
                    "price": p.price,
                    "old_price": p.old_price,
                    "category": p.category,
                    "source_url": p.source_url,
                    "api_product_id": p.api_product_id,
                    "uploaded": p.uploaded_to_api,
                    "errors": p.errors
                }
                for p in products
            ]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        logger.info(f"💾 Результаты сохранены: {output_file}")


# ========================================
# Entry Point
# ========================================

async def main():
    """Точка входа для запуска pipeline."""
    # Инициализируем конфигурацию
    config = init_config()
    
    # Запускаем pipeline
    async with FixPriceETLPipeline(config) as pipeline:
        await pipeline.run_full_pipeline(
            categories_limit=None,  # Все категории
            max_products_per_category=100  # Макс. 100 товаров на категорию
        )


if __name__ == "__main__":
    asyncio.run(main())
