# ============================================
# Fix-Price ETL Pipeline - Web Scraper
# ============================================
"""
Модуль парсинга данных с fix-price.com используя Playwright и BeautifulSoup.
"""

import asyncio
import re
from typing import List, Optional, Dict, Any, AsyncGenerator
from urllib.parse import urljoin, urlparse
from dataclasses import dataclass

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from fake_useragent import UserAgent
from loguru import logger

from models import Product, ProductSpecs, ProductImage, Category
from config import Config


@dataclass
class ScrapingConfig:
    """Конфигурация для скрапинга."""
    headless: bool = True
    browser_type: str = 'chromium'
    timeout: int = 30000
    navigation_timeout: int = 30000


class FixPriceScraper:
    """
    Скрапер для fix-price.com.
    Использует Playwright для JS-рендеринга и BeautifulSoup для парсинга HTML.
    """
    
    # Селекторы для парсинга
    SELECTORS = {
        # Категории
        'category_links': 'a[href*="/catalog/"]',
        'category_list': '.catalog-categories a, .category-item a, nav a[href*="/catalog/"]',
        
        # Товары в списке
        'product_cards': '.product-card, .catalog-item, [data-product-id], .goods-item',
        'product_link': 'a[href*="/product/"], a.product-link',
        'product_title': '.product-title, .product-name, h1, .goods-title',
        'product_price': '.price-current, .product-price-current, [data-price], .price',
        'product_old_price': '.price-old, .product-price-old, .old-price',
        
        # Страница товара
        'product_page_title': 'h1, .product-detail h1, .product-info h1',
        'product_page_description': '.product-description, .description, [itemprop="description"]',
        'product_page_price': '.price-current, .product-price, [data-price]',
        'product_page_old_price': '.price-old, .old-price, .compare-price',
        'product_images': '.product-image img, .gallery-image img, .product-gallery img, [data-src]',
        'product_specs': '.product-specs, .specifications, .product-attributes',
        'spec_row': '.spec-row, .attribute-row, tr',
        'spec_name': '.spec-name, .attribute-name, td:first-child',
        'spec_value': '.spec-value, .attribute-value, td:last-child',
        'in_stock': '.in-stock, .available, [data-available="true"]',
        'out_of_stock': '.out-of-stock, .unavailable, [data-available="false"]',
        'sku': '.sku, .article, [data-sku]',
    }
    
    def __init__(self, config: Config, scraping_config: Optional[ScrapingConfig] = None):
        self.config = config
        self.scraping_config = scraping_config or ScrapingConfig(
            headless=config.HEADLESS,
            browser_type=config.BROWSER_TYPE
        )
        self.ua = UserAgent()
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        
    async def __aenter__(self):
        """Асинхронный контекстный менеджер - инициализация браузера."""
        await self.init_browser()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Закрытие браузера."""
        await self.close()
    
    async def init_browser(self):
        """Инициализирует Playwright браузер."""
        logger.info("🚀 Инициализация Playwright браузера...")
        
        self.playwright = await async_playwright().start()
        
        # Выбираем тип браузера
        if self.scraping_config.browser_type == 'firefox':
            browser_class = self.playwright.firefox
        elif self.scraping_config.browser_type == 'webkit':
            browser_class = self.playwright.webkit
        else:
            browser_class = self.playwright.chromium
        
        # Запускаем браузер
        self.browser = await browser_class.launch(
            headless=self.scraping_config.headless,
            args=['--no-sandbox', '--disable-dev-shm-usage'] if self.scraping_config.headless else []
        )
        
        # Создаем контекст с рандомным User-Agent
        self.context = await self.browser.new_context(
            user_agent=self.ua.random,
            viewport={'width': 1920, 'height': 1080},
            locale='ru-RU',
            timezone_id='Europe/Moscow'
        )
        
        # Устанавливаем таймауты
        self.context.set_default_timeout(self.scraping_config.timeout)
        self.context.set_default_navigation_timeout(self.scraping_config.navigation_timeout)
        
        logger.info("✅ Браузер инициализирован")
    
    async def close(self):
        """Закрывает браузер."""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if hasattr(self, 'playwright'):
            await self.playwright.stop()
        logger.info("🔒 Браузер закрыт")
    
    def _get_random_headers(self) -> Dict[str, str]:
        """Возвращает случайные заголовки."""
        return {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
    
    async def _create_page(self) -> Page:
        """Создает новую страницу с рандомными заголовками."""
        page = await self.context.new_page()
        
        # Устанавливаем дополнительные заголовки
        await page.set_extra_http_headers(self._get_random_headers())
        
        # Маскируем webdriver
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
        """)
        
        return page
    
    async def get_page_content(self, url: str, wait_for_selector: Optional[str] = None) -> str:
        """
        Получает HTML-контент страницы через Playwright.
        
        Args:
            url: URL страницы
            wait_for_selector: Селектор для ожидания загрузки
            
        Returns:
            HTML-контент страницы
        """
        page = await self._create_page()
        
        try:
            logger.debug(f"🌐 Загрузка: {url}")
            
            # Переходим на страницу
            response = await page.goto(url, wait_until='networkidle')
            
            if not response or response.status >= 400:
                raise Exception(f"HTTP {response.status if response else 'Unknown'} для {url}")
            
            # Ждем загрузки контента
            if wait_for_selector:
                await page.wait_for_selector(wait_for_selector, timeout=10000)
            else:
                # Ждем основные элементы
                await asyncio.sleep(1)  # Даем время на JS-рендеринг
            
            # Прокручиваем страницу для подгрузки lazy-контента
            await self._scroll_page(page)
            
            content = await page.content()
            logger.debug(f"✅ Страница загружена: {len(content)} bytes")
            
            return content
            
        finally:
            await page.close()
    
    async def _scroll_page(self, page: Page, scroll_delay: float = 0.5):
        """Прокручивает страницу для подгрузки lazy-контента."""
        try:
            # Прокручиваем вниз постепенно
            for _ in range(3):
                await page.evaluate('window.scrollBy(0, window.innerHeight)')
                await asyncio.sleep(scroll_delay)
            
            # Возвращаемся наверх
            await page.evaluate('window.scrollTo(0, 0)')
            await asyncio.sleep(0.3)
            
        except Exception as e:
            logger.warning(f"⚠️ Ошибка при скролле: {e}")
    
    async def get_categories(self) -> List[Category]:
        """
        Получает список всех категорий из каталога.
        
        Returns:
            Список категорий
        """
        logger.info("📂 Получение списка категорий...")
        
        content = await self.get_page_content(
            self.config.FIX_PRICE_CATALOG_URL,
            wait_for_selector='.catalog-categories, .category-list, main'
        )
        
        soup = BeautifulSoup(content, 'lxml')
        categories = []
        
        # Ищем ссылки на категории
        for link in soup.select(self.SELECTORS['category_links']):
            href = link.get('href', '')
            name = link.get_text(strip=True)
            
            if href and name and '/catalog/' in href:
                url = urljoin(self.config.FIX_PRICE_BASE_URL, href)
                categories.append(Category(
                    name=name,
                    url=url,
                    level=href.count('/') - 1
                ))
        
        # Убираем дубликаты по URL
        seen_urls = set()
        unique_categories = []
        for cat in categories:
            if cat.url not in seen_urls:
                seen_urls.add(cat.url)
                unique_categories.append(cat)
        
        logger.info(f"✅ Найдено категорий: {len(unique_categories)}")
        return unique_categories
    
    async def get_products_from_category(
        self, 
        category_url: str, 
        max_pages: Optional[int] = None
    ) -> List[str]:
        """
        Получает список URL товаров из категории.
        
        Args:
            category_url: URL категории
            max_pages: Максимальное количество страниц (None = все)
            
        Returns:
            Список URL товаров
        """
        logger.info(f"📄 Получение товаров из категории: {category_url}")
        
        product_urls = []
        page_num = 1
        
        while True:
            if max_pages and page_num > max_pages:
                break
            
            page_url = f"{category_url}?page={page_num}" if page_num > 1 else category_url
            
            try:
                content = await self.get_page_content(
                    page_url,
                    wait_for_selector='.product-card, .catalog-item, [data-product-id]'
                )
                
                soup = BeautifulSoup(content, 'lxml')
                
                # Ищем ссылки на товары
                page_products = []
                for link in soup.select(self.SELECTORS['product_link']):
                    href = link.get('href', '')
                    if href and ('/product/' in href or '/goods/' in href):
                        full_url = urljoin(self.config.FIX_PRICE_BASE_URL, href)
                        page_products.append(full_url)
                
                if not page_products:
                    logger.debug(f"⏹️ Нет товаров на странице {page_num}")
                    break
                
                product_urls.extend(page_products)
                logger.debug(f"   Страница {page_num}: {len(page_products)} товаров")
                
                # Проверяем есть ли следующая страница
                pagination = soup.select('.pagination, .pager')
                next_page = soup.select_one('a[rel="next"], .next-page')
                
                if not next_page and len(page_products) < 12:  # Предполагаем 12 товаров на страницу
                    break
                
                page_num += 1
                await asyncio.sleep(self.config.REQUEST_DELAY)
                
            except Exception as e:
                logger.error(f"❌ Ошибка при получении страницы {page_num}: {e}")
                break
        
        # Убираем дубликаты
        product_urls = list(dict.fromkeys(product_urls))
        logger.info(f"✅ Найдено товаров в категории: {len(product_urls)}")
        
        return product_urls
    
    def _parse_price(self, price_text: Optional[str]) -> Optional[float]:
        """Парсит цену из текста."""
        if not price_text:
            return None
        
        # Убираем все кроме цифр и запятой/точки
        cleaned = re.sub(r'[^\d.,]', '', price_text.replace(' ', '').replace('\xa0', ''))
        cleaned = cleaned.replace(',', '.')
        
        try:
            return float(cleaned) if cleaned else None
        except ValueError:
            return None
    
    def _extract_specs(self, soup: BeautifulSoup) -> ProductSpecs:
        """Извлекает характеристики товара."""
        specs = ProductSpecs()
        additional = {}
        
        specs_container = soup.select_one(self.SELECTORS['product_specs'])
        
        if specs_container:
            for row in specs_container.select(self.SELECTORS['spec_row']):
                name_elem = row.select_one(self.SELECTORS['spec_name'])
                value_elem = row.select_one(self.SELECTORS['spec_value'])
                
                if name_elem and value_elem:
                    name = name_elem.get_text(strip=True).lower()
                    value = value_elem.get_text(strip=True)
                    
                    if 'бренд' in name or 'brand' in name:
                        specs.brand = value
                    elif 'вес' in name or 'weight' in name:
                        specs.weight = value
                    elif 'страна' in name or 'country' in name:
                        specs.country = value
                    elif 'размер' in name or 'dimension' in name:
                        specs.dimensions = value
                    elif 'материал' in name or 'material' in name:
                        specs.material = value
                    else:
                        additional[name] = value
        
        specs.additional = additional
        return specs
    
    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[ProductImage]:
        """Извлекает URL изображений товара."""
        images = []
        
        # Ищем изображения по разным селекторам
        img_selectors = [
            '.product-image img',
            '.gallery-image img',
            '.product-gallery img',
            '[data-src]',
            '.swiper-slide img',
            '.product-photos img'
        ]
        
        found_urls = set()
        
        for selector in img_selectors:
            for img in soup.select(selector):
                # Пробуем разные атрибуты для URL изображения
                for attr in ['data-src', 'data-original', 'src', 'data-lazy']:
                    src = img.get(attr)
                    if src:
                        # Преобразуем относительные URL
                        full_url = urljoin(base_url, src)
                        
                        # Пропускаем placeholder изображения
                        if 'placeholder' in full_url.lower() or 'data:image' in full_url:
                            continue
                        
                        # Получаем оригинальное изображение (без resize)
                        original_url = re.sub(r'/resize/\d+x\d+/', '/', full_url)
                        original_url = re.sub(r'\?w=\d+&h=\d+', '', original_url)
                        
                        if original_url not in found_urls:
                            found_urls.add(original_url)
                            images.append(ProductImage(
                                original_url=original_url,
                                is_primary=len(images) == 0
                            ))
                        break
        
        return images
    
    async def parse_product(self, product_url: str) -> Optional[Product]:
        """
        Парсит детальную информацию о товаре.
        
        Args:
            product_url: URL товара
            
        Returns:
            Объект Product или None в случае ошибки
        """
        logger.debug(f"🔍 Парсинг товара: {product_url}")
        
        try:
            content = await self.get_page_content(
                product_url,
                wait_for_selector='h1, .product-title'
            )
            
            soup = BeautifulSoup(content, 'lxml')
            
            # --- Название ---
            title_elem = soup.select_one(self.SELECTORS['product_page_title'])
            if not title_elem:
                title_elem = soup.select_one('h1')
            title = title_elem.get_text(strip=True) if title_elem else None
            
            if not title:
                logger.warning(f"⚠️ Не найдено название товара: {product_url}")
                return None
            
            # --- Описание ---
            description_elem = soup.select_one(self.SELECTORS['product_page_description'])
            description = description_elem.get_text(strip=True) if description_elem else None
            
            # --- Цены ---
            price_elem = soup.select_one(self.SELECTORS['product_page_price'])
            price = self._parse_price(price_elem.get_text(strip=True) if price_elem else None)
            
            old_price_elem = soup.select_one(self.SELECTORS['product_page_old_price'])
            old_price = self._parse_price(old_price_elem.get_text(strip=True) if old_price_elem else None)
            
            # Если не нашли цену - товар недоступен или ошибка
            if price is None:
                logger.warning(f"⚠️ Не найдена цена товара: {product_url}")
                # Продолжаем с price=0, чтобы не терять товар
                price = 0.0
            
            # --- Наличие ---
            in_stock = True
            if soup.select_one(self.SELECTORS['out_of_stock']):
                in_stock = False
            elif 'нет в наличии' in content.lower():
                in_stock = False
            
            # --- SKU ---
            sku_elem = soup.select_one(self.SELECTORS['sku'])
            sku = sku_elem.get_text(strip=True) if sku_elem else None
            
            # --- Характеристики ---
            specs = self._extract_specs(soup)
            
            # --- Изображения ---
            images = self._extract_images(soup, product_url)
            
            # --- Категории ---
            categories_path = []
            breadcrumbs = soup.select('.breadcrumb a, .breadcrumbs a, [itemprop="itemListElement"] a')
            for crumb in breadcrumbs:
                cat_name = crumb.get_text(strip=True)
                if cat_name and cat_name.lower() not in ['главная', 'home']:
                    categories_path.append(cat_name)
            
            # Создаем объект товара
            product = Product(
                source_id=sku or self._extract_product_id(product_url),
                source_url=product_url,
                title=title,
                description=description,
                price=price,
                old_price=old_price,
                category=categories_path[-1] if categories_path else None,
                categories_path=categories_path,
                specs=specs,
                images=images,
                in_stock=in_stock,
                sku=sku,
                processed=True
            )
            
            logger.debug(f"✅ Товар распарсен: {title[:50]}... | Цена: {price}")
            return product
            
        except Exception as e:
            logger.error(f"❌ Ошибка парсинга товара {product_url}: {e}")
            return None
    
    def _extract_product_id(self, url: str) -> str:
        """Извлекает ID товара из URL."""
        # Пробуем найти ID в URL
        match = re.search(r'/product[s]?/(\d+)', url)
        if match:
            return match.group(1)
        
        # Если не нашли - используем хеш URL
        import hashlib
        return hashlib.md5(url.encode()).hexdigest()[:12]
    
    async def parse_products_batch(
        self, 
        product_urls: List[str],
        progress_callback=None
    ) -> List[Product]:
        """
        Парсит батч товаров с ограничением concurrency.
        
        Args:
            product_urls: Список URL товаров
            progress_callback: Callback для обновления прогресса
            
        Returns:
            Список распарсенных товаров
        """
        products = []
        semaphore = asyncio.Semaphore(self.config.CONCURRENCY_LIMIT)
        
        async def parse_with_limit(url: str) -> Optional[Product]:
            async with semaphore:
                product = await self.parse_product(url)
                if progress_callback:
                    progress_callback()
                await asyncio.sleep(self.config.REQUEST_DELAY)
                return product
        
        # Создаем задачи
        tasks = [parse_with_limit(url) for url in product_urls]
        
        # Выполняем с ограничением concurrency
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, Product):
                products.append(result)
            elif isinstance(result, Exception):
                logger.error(f"❌ Ошибка в задаче: {result}")
        
        return products
