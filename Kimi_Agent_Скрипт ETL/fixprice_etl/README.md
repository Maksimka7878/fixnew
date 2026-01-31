# Fix-Price ETL Pipeline

Полноценный ETL pipeline для парсинга товаров с [fix-price.com](https://fix-price.com) и автоматической загрузки на ваш сервер через API.

## 📋 Содержание

- [Архитектура](#-архитектура)
- [Установка](#-установка)
- [Конфигурация](#-конфигурация)
- [Использование](#-использование)
- [API Endpoints](#-api-endpoints-для-вашего-бэкенда)
- [Структура проекта](#-структура-проекта)

---

## 🏗️ Архитектура

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   fix-price.com │────▶│  ETL Pipeline   │────▶│   Your API      │
│   (Source)      │     │   (Python)      │     │   (Destination) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
            ┌──────────────┐      ┌──────────────┐
            │   EXTRACT    │      │    LOAD      │
            │  Playwright  │      │   httpx      │
            │  BeautifulSoup│     │  multipart   │
            └──────────────┘      └──────────────┘
```

### Этапы работы

1. **EXTRACT** - Парсинг данных с fix-price.com
   - Playwright для JS-рендеринга
   - BeautifulSoup4 для парсинга HTML
   - Асинхронная обработка с ограничением concurrency

2. **TRANSFORM** - Фильтрация и валидация
   - Фильтр "50%" - каждый второй товар
   - Равномерная выборка по категориям
   - Валидация обязательных полей

3. **LOAD** - Загрузка на ваш сервер
   - Скачивание изображений в BytesIO (без сохранения на диск)
   - Загрузка через `multipart/form-data`
   - Retry логика с exponential backoff

---

## 🚀 Установка

### 1. Клонируйте или скачайте проект

```bash
cd fixprice_etl
```

### 2. Создайте виртуальное окружение

```bash
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

### 3. Установите зависимости

```bash
pip install -r requirements.txt
```

### 4. Установите Playwright браузеры

```bash
playwright install chromium
```

---

## ⚙️ Конфигурация

### 1. Создайте `.env` файл

```bash
cp .env.example .env
```

### 2. Заполните обязательные переменные

```env
# --- Destination API Configuration ---
MY_API_URL=https://your-domain.com/api/v1
API_TOKEN=your_api_token_here

# --- Optional Settings ---
CONCURRENCY_LIMIT=5
PRODUCT_SAMPLE_PERCENT=50
HEADLESS=true
LOG_LEVEL=INFO
```

### Полный список переменных окружения

| Переменная | Обязательная | По умолчанию | Описание |
|------------|--------------|--------------|----------|
| `MY_API_URL` | ✅ | - | URL вашего API |
| `API_TOKEN` | ✅ | - | Токен для авторизации |
| `CONCURRENCY_LIMIT` | ❌ | 5 | Макс. одновременных запросов |
| `PRODUCT_SAMPLE_PERCENT` | ❌ | 50 | Процент товаров для загрузки |
| `REQUEST_DELAY` | ❌ | 1.0 | Задержка между запросами (сек) |
| `MAX_RETRIES` | ❌ | 3 | Количество retry попыток |
| `HEADLESS` | ❌ | true | Headless режим браузера |
| `LOG_LEVEL` | ❌ | INFO | Уровень логирования |

---

## 🎯 Использование

### Базовый запуск

```bash
python pipeline.py
```

### Запуск с ограничениями (для тестирования)

```python
import asyncio
from pipeline import FixPriceETLPipeline
from config import init_config

async def main():
    config = init_config()
    
    async with FixPriceETLPipeline(config) as pipeline:
        await pipeline.run_full_pipeline(
            categories_limit=3,        # Только 3 категории
            max_products_per_category=50  # По 50 товаров на категорию
        )

asyncio.run(main())
```

### Только парсинг (без загрузки на API)

```python
from scraper import FixPriceScraper
from config import init_config

async def parse_only():
    config = init_config()
    
    async with FixPriceScraper(config) as scraper:
        # Получаем категории
        categories = await scraper.get_categories()
        
        # Получаем товары из первой категории
        urls = await scraper.get_products_from_category(categories[0].url)
        
        # Парсим детали
        products = await scraper.parse_products_batch(urls[:10])
        
        for p in products:
            print(f"{p.title}: {p.price} ₽")

asyncio.run(parse_only())
```

---

## 🔌 API Endpoints (для вашего бэкенда)

Ваш бэкенд должен реализовать следующие endpoints:

### 1. Создание товара

```http
POST /api/v1/products
Authorization: Bearer {API_TOKEN}
Content-Type: application/json

{
  "external_id": "12345",
  "name": "Название товара",
  "price": 174.50,
  "images": [{"url": "...", "is_primary": true}],
  ...
}
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "id": "product_123",
  "message": "Product created successfully"
}
```

### 2. Загрузка изображения

```http
POST /api/v1/media/upload
Authorization: Bearer {API_TOKEN}
Content-Type: multipart/form-data

file: [binary image data]
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "url": "https://your-cdn.com/uploads/image.jpg"
}
```

См. полный пример payload в файле [`example_payload.json`](example_payload.json).

---

## 📁 Структура проекта

```
fixprice_etl/
│
├── .env                  # Переменные окружения (создайте из .env.example)
├── .env.example          # Пример конфигурации
├── requirements.txt      # Python зависимости
│
├── config.py            # Конфигурация через pydantic-settings
├── models.py            # Pydantic модели данных
├── scraper.py           # Playwright + BeautifulSoup скрапер
├── api_client.py        # Асинхронный HTTP клиент с retry
├── pipeline.py          # Главный ETL pipeline
│
├── example_payload.json  # Пример JSON для вашего API
└── README.md            # Этот файл
```

---

## 🔧 Технические детали

### Retry Логика

Используется библиотека `tenacity` с exponential backoff:

```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=10),
    retry=retry_if_exception_type((httpx.HTTPStatusError, ...))
)
```

### User-Agent Ротация

```python
from fake_useragent import UserAgent
ua = UserAgent()
headers = {'User-Agent': ua.random}
```

### Concurrency Control

```python
semaphore = asyncio.Semaphore(5)  # Макс. 5 одновременных запросов

async with semaphore:
    # HTTP запрос
```

### Обработка изображений

```python
# Скачивание в память (без сохранения на диск)
response = await client.get(image_url)
image_buffer = BytesIO(response.content)

# Загрузка через multipart
files = {'file': ('image.jpg', image_buffer, 'image/jpeg')}
await client.post(upload_url, files=files)
```

---

## 📊 Логирование

Логи выводятся в консоль с цветовой подсветкой:

```
2024-01-15 10:30:00 | INFO     | pipeline:run_full_pipeline:150 - 🚀 Fix-Price ETL Pipeline - Запуск
2024-01-15 10:30:05 | INFO     | scraper:get_categories:180 - ✅ Найдено категорий: 25
2024-01-15 10:35:12 | INFO     | api_client:create_product:245 - ✅ Товар создан: ID=prod_123
```

---

## ⚠️ Важные замечания

1. **Уважайте сервер fix-price.com** - не увеличивайте `CONCURRENCY_LIMIT` выше 10
2. **Проверяйте robots.txt** - убедитесь что парсинг разрешен
3. **Используйте задержки** - `REQUEST_DELAY` помогает избежать бана
4. **Сохраняйте результаты** - скрипт сохраняет JSON с результатами в папку `output/`

---

## 📝 Лицензия

MIT License - используйте на свой страх и риск.

**Внимание:** Парсинг сайтов может нарушать их Terms of Service. Используйте ответственно.
